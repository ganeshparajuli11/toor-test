import express from 'express';
import axios from 'axios';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { getSettings } from '../config/store.js';

const router = express.Router();

// Cache for reviews dump (to avoid downloading every time)
let reviewsCache = {
    data: null,
    lastFetch: null,
    ttl: 1000 * 60 * 60 * 24 // 24 hours cache
};

// RateHawk API Base URL
const RATEHAWK_BASE_URL = 'https://api.worldota.net/api/b2b/v3';

/**
 * Get authorization header for RateHawk API
 * Uses Basic Auth: KEY_ID:API_KEY
 */
const getAuthHeader = async () => {
    const settings = await getSettings();
    const { apiKey, keyId } = settings.ratehawk;

    if (!apiKey || !keyId) {
        throw new Error('RateHawk API credentials not configured');
    }

    return `Basic ${Buffer.from(`${keyId}:${apiKey}`).toString('base64')}`;
};

/**
 * Make request to RateHawk API
 */
const callRateHawkAPI = async (endpoint, body) => {
    const authHeader = await getAuthHeader();
    const url = `${RATEHAWK_BASE_URL}${endpoint}`;

    console.log(`[RateHawk API] POST ${url}`);
    console.log(`[RateHawk API] Body:`, JSON.stringify(body, null, 2));

    const response = await axios({
        method: 'POST',
        url,
        data: body,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
        },
        timeout: 30000
    });

    return response.data;
};

/**
 * POST /api/hotels/autocomplete
 * Search for cities/regions by name
 *
 * Body: { query: string, language?: string }
 * Returns: { regions: [], hotels: [] }
 */
router.post('/autocomplete', async (req, res) => {
    try {
        const { query, language = 'en' } = req.body;

        if (!query || query.length < 2) {
            return res.status(400).json({ error: 'Query must be at least 2 characters' });
        }

        const response = await callRateHawkAPI('/search/multicomplete/', {
            query,
            language
        });

        // Clean response - only send what frontend needs
        const regions = (response.data?.regions || []).map(r => ({
            id: r.id,
            name: r.name,
            type: r.type,
            country_code: r.country_code,
            label: `${r.name}${r.country_code ? `, ${r.country_code}` : ''}`
        }));

        const hotels = (response.data?.hotels || []).map(h => ({
            id: h.id,
            hid: h.hid,
            name: h.name,
            region_id: h.region_id,
            label: h.name
        }));

        res.json({
            success: true,
            regions,
            hotels
        });

    } catch (error) {
        console.error('[Autocomplete Error]', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/hotels/suggested
 * Get suggested hotels using multicomplete API
 * Returns hotels with actual names and real ratings from hotel/info API
 *
 * Body: { query: string, language?: string }
 */
router.post('/suggested', async (req, res) => {
    try {
        const { query = 'popular', language = 'en' } = req.body;

        // Use multicomplete API to get suggested hotels
        const response = await callRateHawkAPI('/search/multicomplete/', {
            query,
            language
        });

        const rawHotels = response.data?.hotels || [];
        const rawRegions = response.data?.regions || [];

        console.log(`[Suggested] Found ${rawHotels.length} hotels and ${rawRegions.length} regions for "${query}"`);

        // Process images - replace {size} placeholder
        const processImage = (url) => {
            if (!url) return null;
            if (typeof url !== 'string') return null;

            let processed = url;

            // Decode URL-encoded placeholders
            processed = processed.replace(/%7Bsize%7D/gi, '{size}');
            processed = processed.replace(/%7B/g, '{').replace(/%7D/g, '}');

            // Replace {size} placeholders
            processed = processed.replace(/t\/\{size\}\//gi, 't/1024x768/');
            processed = processed.replace(/\/\{size\}\//gi, '/1024x768/');
            processed = processed.replace(/t\{size\}/gi, '1024x768');
            processed = processed.replace(/_\{size\}_/gi, '_1024x768_');
            processed = processed.replace(/\{size\}/gi, '1024x768');

            // Ensure HTTPS
            if (processed.startsWith('http://')) {
                processed = processed.replace('http://', 'https://');
            }
            if (processed.startsWith('//')) {
                processed = 'https:' + processed;
            }

            return processed;
        };

        // Default images for suggested hotels (fallback if API doesn't return images)
        const defaultImages = [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop'
        ];

        // Fetch real hotel info for each hotel to get actual ratings and reviews
        // Do this in parallel for speed (limit to first 6 hotels)
        const hotelsToFetch = rawHotels.slice(0, 6);
        const hotelInfoPromises = hotelsToFetch.map(async (hotel, index) => {
            try {
                // Small delay to avoid rate limiting (staggered by 50ms each)
                await new Promise(resolve => setTimeout(resolve, index * 50));

                const infoResponse = await callRateHawkAPI('/hotel/info/', {
                    id: hotel.id,
                    language
                });

                const info = infoResponse.data;
                if (info) {
                    // Process hotel images from API
                    const apiImages = (info.images || []).map(img => {
                        if (typeof img === 'string') return processImage(img);
                        return processImage(img?.url);
                    }).filter(Boolean);

                    return {
                        id: hotel.id,
                        hid: hotel.hid,
                        name: hotel.name || info.name,
                        region_id: hotel.region_id,
                        location: info.city || info.address || '',
                        image: apiImages[0] || defaultImages[index % defaultImages.length],
                        images: apiImages.length > 0 ? apiImages.slice(0, 5) : [defaultImages[index % defaultImages.length]],
                        // Use REAL data from API
                        rating: info.star_rating || 0, // Star rating (1-5)
                        reviewScore: info.review_score ? Math.round(info.review_score * 10) / 10 : 0, // Round to 1 decimal
                        reviews: info.reviews_count || 0,
                        price: Math.floor(Math.random() * 200) + 80, // Price still random (need search API for real prices)
                        currency: 'USD',
                        amenities: extractAmenities(info.amenity_groups),
                        description: info.description || `Experience luxury at ${hotel.name}`
                    };
                }
                return null;
            } catch (err) {
                console.log(`[Suggested] Could not fetch info for hotel ${hotel.id}:`, err.message);
                // Return basic info with defaults
                return {
                    id: hotel.id,
                    hid: hotel.hid,
                    name: hotel.name,
                    region_id: hotel.region_id,
                    image: defaultImages[index % defaultImages.length],
                    images: [defaultImages[index % defaultImages.length]],
                    rating: 0,
                    reviewScore: 0,
                    reviews: 0,
                    price: Math.floor(Math.random() * 200) + 80,
                    currency: 'USD',
                    amenities: ['Free WiFi', 'Air Conditioning'],
                    description: `Experience luxury at ${hotel.name}`
                };
            }
        });

        // Wait for all hotel info requests
        const hotelsWithInfo = await Promise.all(hotelInfoPromises);
        const hotels = hotelsWithInfo.filter(h => h !== null);

        console.log(`[Suggested] Enriched ${hotels.length} hotels with real info`);

        // Also include region info for context
        const regions = rawRegions.map(r => ({
            id: r.id,
            name: r.name,
            type: r.type,
            country_code: r.country_code
        }));

        res.json({
            success: true,
            query,
            hotels,
            regions,
            total_hotels: hotels.length,
            total_regions: regions.length
        });

    } catch (error) {
        console.error('[Suggested Error]', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Helper function to extract amenities from amenity_groups
 */
function extractAmenities(amenityGroups) {
    const amenities = [];
    if (amenityGroups && Array.isArray(amenityGroups)) {
        amenityGroups.forEach(group => {
            if (group.amenities) {
                group.amenities.forEach(a => {
                    const name = typeof a === 'string' ? a : (a.name || a);
                    if (name && amenities.length < 6) {
                        amenities.push(name);
                    }
                });
            }
        });
    }
    // If no amenities found, return defaults
    return amenities.length > 0 ? amenities : ['Free WiFi', 'Air Conditioning'];
}

/**
 * POST /api/hotels/search
 * Search for hotels by region
 *
 * Body: {
 *   region_id: number,
 *   checkin: string (YYYY-MM-DD),
 *   checkout: string (YYYY-MM-DD),
 *   guests: [{ adults: number, children: number[] }],
 *   currency?: string,
 *   language?: string,
 *   residency?: string
 * }
 */
router.post('/search', async (req, res) => {
    try {
        const {
            region_id,
            checkin,
            checkout,
            guests = [{ adults: 2, children: [] }],
            currency = 'USD',
            language = 'en',
            residency = 'us'
        } = req.body;

        // Validate required fields
        if (!region_id) {
            return res.status(400).json({ error: 'region_id is required' });
        }
        if (!checkin || !checkout) {
            return res.status(400).json({ error: 'checkin and checkout dates are required' });
        }

        // Call RateHawk Search API
        const response = await callRateHawkAPI('/search/serp/region/', {
            region_id: Number(region_id),
            checkin,
            checkout,
            guests,
            currency,
            language,
            residency,
            timeout: 20
        });

        const rawHotels = response.data?.hotels || [];
        console.log(`[Search] Found ${rawHotels.length} hotels`);

        // Clean and transform response for frontend
        const hotels = rawHotels.map(hotel => {
            // Get best offer (cheapest rate)
            const rates = hotel.rates || [];
            let bestOffer = null;

            if (rates.length > 0) {
                // Find cheapest rate
                let minPrice = Infinity;
                rates.forEach(rate => {
                    const payment = rate.payment_options?.payment_types?.[0];
                    if (payment) {
                        const price = parseFloat(payment.show_amount) || Infinity;
                        if (price < minPrice) {
                            minPrice = price;
                            bestOffer = {
                                match_hash: rate.match_hash,
                                room_name: rate.room_name,
                                total_price: payment.show_amount,
                                currency: payment.show_currency_code || currency,
                                daily_price: rate.daily_prices?.[0] || '0',
                                meal: rate.meal_data?.has_breakfast ? 'Breakfast included' : 'No meal',
                                meal_code: rate.meal,
                                free_cancellation_before: payment.cancellation_penalties?.free_cancellation_before || null,
                                amenities: rate.amenities_data || []
                            };
                        }
                    }
                });
            }

            return {
                id: hotel.id,
                hid: hotel.hid,
                name: hotel.name || hotel.id,
                best_offer: bestOffer,
                total_rates: rates.length
            };
        }).filter(h => h.best_offer !== null); // Only include hotels with valid offers

        res.json({
            success: true,
            total_hotels: hotels.length,
            checkin,
            checkout,
            currency,
            hotels
        });

    } catch (error) {
        console.error('[Search Error]', error.message);
        if (error.response) {
            console.error('[Search Error Response]', error.response.data);
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/hotels/info
 * Get hotel details by ID
 *
 * Body: { id: string, language?: string }
 */
router.post('/info', async (req, res) => {
    try {
        const { id, language = 'en' } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Hotel id is required' });
        }

        const response = await callRateHawkAPI('/hotel/info/', {
            id,
            language
        });

        const hotel = response.data;

        if (!hotel) {
            return res.status(404).json({ error: 'Hotel not found' });
        }

        // Process images - replace {size} placeholder with actual dimensions
        const processImage = (url) => {
            if (!url) return null;
            if (typeof url !== 'string') return null;

            let processed = url;

            // First, decode any URL-encoded placeholders
            // %7B = { and %7D = }
            processed = processed.replace(/%7Bsize%7D/gi, '{size}');
            processed = processed.replace(/%7B/g, '{').replace(/%7D/g, '}');

            // Handle various {size} placeholder formats from RateHawk
            // Format examples:
            // - t/{size}/hash.jpg
            // - /{size}/hash.jpg
            // - {size}
            // - t{size}
            // - _{size}_
            processed = processed.replace(/t\/\{size\}\//gi, 't/1024x768/');
            processed = processed.replace(/\/\{size\}\//gi, '/1024x768/');
            processed = processed.replace(/t\{size\}/gi, '1024x768');
            processed = processed.replace(/_\{size\}_/gi, '_1024x768_');
            processed = processed.replace(/\{size\}/gi, '1024x768');

            // Also handle size placeholders with different names
            processed = processed.replace(/\{width\}x\{height\}/gi, '1024x768');
            processed = processed.replace(/\{w\}x\{h\}/gi, '1024x768');

            // Ensure HTTPS
            if (processed.startsWith('http://')) {
                processed = processed.replace('http://', 'https://');
            }

            // Add protocol if missing but has domain
            if (processed.startsWith('//')) {
                processed = 'https:' + processed;
            }

            return processed;
        };

        // Log raw hotel data for debugging
        console.log('[Hotel Info] Raw hotel keys:', Object.keys(hotel));
        console.log('[Hotel Info] Raw images count:', (hotel.images || []).length);
        if (hotel.images && hotel.images.length > 0) {
            console.log('[Hotel Info] First 3 image samples:', JSON.stringify(hotel.images.slice(0, 3)));
        }

        // Check for images in different possible locations
        let allRawImages = [];

        // 1. Main images array
        if (hotel.images && Array.isArray(hotel.images)) {
            allRawImages.push(...hotel.images);
        }

        // 2. Photo info
        if (hotel.photo_info && Array.isArray(hotel.photo_info)) {
            allRawImages.push(...hotel.photo_info);
        }

        // 3. Photos array
        if (hotel.photos && Array.isArray(hotel.photos)) {
            allRawImages.push(...hotel.photos);
        }

        // 4. Main image/thumbnail
        if (hotel.main_photo) {
            allRawImages.push(hotel.main_photo);
        }
        if (hotel.thumbnail) {
            allRawImages.push(hotel.thumbnail);
        }

        // 5. Room groups images
        if (hotel.room_groups && Array.isArray(hotel.room_groups)) {
            hotel.room_groups.forEach(room => {
                if (room.images && Array.isArray(room.images)) {
                    allRawImages.push(...room.images);
                }
                if (room.photos && Array.isArray(room.photos)) {
                    allRawImages.push(...room.photos);
                }
                // Room group name_struct might have images
                if (room.name_struct && room.name_struct.images) {
                    allRawImages.push(...room.name_struct.images);
                }
            });
        }

        console.log('[Hotel Info] Total raw images found:', allRawImages.length);

        // Process images from various formats RateHawk might return
        const images = allRawImages.map((img, idx) => {
            // String URL - most common format
            if (typeof img === 'string') {
                return processImage(img);
            }
            // Object with various property names
            if (img && typeof img === 'object') {
                // Try different property names that RateHawk might use
                const url = img.url || img.src || img.image || img.photo || img.tmpl ||
                           img.orig || img.original || img.large || img.medium || img.small ||
                           img.thumbnail || img.preview || img.link || img.href;
                if (url) return processImage(url);

                // Check for nested structure
                if (img.images && typeof img.images === 'string') {
                    return processImage(img.images);
                }
            }
            return null;
        }).filter(Boolean);

        // Remove duplicates
        const uniqueImages = [...new Set(images)];

        console.log('[Hotel Info] Processed images count:', uniqueImages.length);
        if (uniqueImages.length > 0) {
            console.log('[Hotel Info] First processed image:', uniqueImages[0]);
        }

        // Extract amenities from amenity_groups
        let amenities = [];
        if (hotel.amenity_groups) {
            hotel.amenity_groups.forEach(group => {
                if (group.amenities) {
                    amenities.push(...group.amenities.map(a =>
                        typeof a === 'string' ? a : (a.name || a)
                    ));
                }
            });
        }

        // Extract description from description_struct
        let description = [];
        if (hotel.description_struct && Array.isArray(hotel.description_struct)) {
            hotel.description_struct.forEach(section => {
                if (section.paragraphs && Array.isArray(section.paragraphs)) {
                    description.push(...section.paragraphs);
                }
            });
        }
        // Fallback to plain description if no struct
        if (description.length === 0 && hotel.description) {
            description = [hotel.description];
        }

        // Extract room groups info
        const roomGroups = (hotel.room_groups || []).map(room => ({
            name: room.name,
            images: (room.images || []).map(processImage).filter(Boolean),
            amenities: room.room_amenities || [],
            size: room.size,
            bedding_type: room.name_struct?.bedding_type,
            bathroom: room.name_struct?.bathroom
        }));

        // Build location string
        let location = hotel.address || '';
        if (hotel.region?.name) {
            location = location ? `${location}, ${hotel.region.name}` : hotel.region.name;
        }
        if (hotel.region?.country_code) {
            location = location ? `${location}, ${hotel.region.country_code}` : hotel.region.country_code;
        }

        // Build clean response with all available data
        const cleanHotel = {
            id: hotel.id,
            hid: hotel.hid,
            name: hotel.name,
            address: hotel.address,
            location: location,
            city: hotel.region?.name || hotel.city,
            country: hotel.region?.country_code || hotel.country,
            star_rating: hotel.star_rating,
            review_score: hotel.review_score,
            reviews_count: hotel.reviews_count,
            latitude: hotel.latitude,
            longitude: hotel.longitude,
            description: description,
            images: uniqueImages.length > 0 ? uniqueImages : [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
                'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop'
            ],
            amenities,
            amenity_groups: hotel.amenity_groups,
            room_groups: roomGroups,
            check_in_time: hotel.check_in_time,
            check_out_time: hotel.check_out_time,
            front_desk_time_start: hotel.front_desk_time_start,
            front_desk_time_end: hotel.front_desk_time_end,
            kind: hotel.kind,
            phone: hotel.phone,
            email: hotel.email ? hotel.email.replace(/[<>]/g, '') : null, // Clean email
            hotel_chain: hotel.hotel_chain,
            postal_code: hotel.postal_code,
            metapolicy_extra_info: hotel.metapolicy_extra_info,
            policy_struct: hotel.policy_struct
        };

        res.json({
            success: true,
            hotel: cleanHotel
        });

    } catch (error) {
        console.error('[Hotel Info Error]', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/hotels/rates
 * Get rates for a specific hotel (re-check before booking)
 *
 * Body: {
 *   id: string,
 *   checkin: string,
 *   checkout: string,
 *   guests: array,
 *   currency?: string,
 *   residency?: string
 * }
 */
router.post('/rates', async (req, res) => {
    try {
        const {
            id,
            checkin,
            checkout,
            guests = [{ adults: 2, children: [] }],
            currency = 'USD',
            residency = 'us',
            language = 'en'
        } = req.body;

        if (!id || !checkin || !checkout) {
            return res.status(400).json({ error: 'id, checkin, and checkout are required' });
        }

        // Search by hotel ID to get current rates
        const response = await callRateHawkAPI('/search/serp/hotels/', {
            ids: [id],
            checkin,
            checkout,
            guests,
            currency,
            residency,
            language
        });

        const hotel = response.data?.hotels?.[0];

        if (!hotel || !hotel.rates || hotel.rates.length === 0) {
            return res.status(404).json({ error: 'No rates available for this hotel' });
        }

        // Transform rates for frontend
        const rates = hotel.rates.map(rate => {
            const payment = rate.payment_options?.payment_types?.[0];
            return {
                match_hash: rate.match_hash,
                room_name: rate.room_name,
                total_price: payment?.show_amount || '0',
                currency: payment?.show_currency_code || currency,
                daily_prices: rate.daily_prices,
                meal: rate.meal_data?.has_breakfast ? 'Breakfast included' : 'No meal',
                meal_code: rate.meal,
                cancellation: {
                    free_cancellation_before: payment?.cancellation_penalties?.free_cancellation_before,
                    policies: payment?.cancellation_penalties?.policies || []
                },
                amenities: rate.amenities_data || [],
                allotment: rate.allotment,
                room_data: rate.room_data_trans
            };
        });

        res.json({
            success: true,
            hotel_id: hotel.id,
            hid: hotel.hid,
            rates
        });

    } catch (error) {
        console.error('[Rates Error]', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/hotels/reviews
 * Get reviews for a specific hotel
 *
 * Body: { id: string, language?: string }
 */
router.post('/reviews', async (req, res) => {
    try {
        const { id, hid, language = 'en' } = req.body;

        if (!id && !hid) {
            return res.status(400).json({ error: 'Hotel id or hid is required' });
        }

        const hotelId = id || hid;
        console.log('[Reviews] Fetching reviews for hotel:', hotelId);

        // Check if we have cached reviews
        const now = Date.now();
        if (reviewsCache.data && reviewsCache.lastFetch && (now - reviewsCache.lastFetch) < reviewsCache.ttl) {
            console.log('[Reviews] Using cached reviews data');

            // Look up hotel in cache (cache is keyed by hotel ID)
            const hotelData = reviewsCache.data[hotelId] || reviewsCache.data[hid];
            if (hotelData && hotelData.reviews && hotelData.reviews.length > 0) {
                const formattedReviews = formatReviews(hotelData.reviews);
                return res.json({
                    success: true,
                    reviews: formattedReviews,
                    total: formattedReviews.length,
                    rating: hotelData.rating,
                    detailedRatings: hotelData.detailed_ratings,
                    source: 'cache'
                });
            }
        }

        // Get the reviews dump URL - wrap in try-catch to handle API errors gracefully
        try {
            console.log('[Reviews] Calling reviews dump API...');
            const dumpResponse = await callRateHawkAPI('/hotel/reviews/dump/', {
                language
            }).catch(apiError => {
                console.log('[Reviews] API call failed:', apiError.message);
                return { data: null };
            });

            if (dumpResponse.data?.url) {
                console.log('[Reviews] Downloading dump from:', dumpResponse.data.url);

                // Download and decompress the gzip file
                const downloadResponse = await axios({
                    method: 'GET',
                    url: dumpResponse.data.url,
                    responseType: 'arraybuffer',
                    timeout: 60000
                });

                // Decompress gzip data
                const compressed = Buffer.from(downloadResponse.data);
                const decompressed = await new Promise((resolve, reject) => {
                    const gunzip = createGunzip();
                    const chunks = [];

                    gunzip.on('data', chunk => chunks.push(chunk));
                    gunzip.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
                    gunzip.on('error', reject);

                    gunzip.write(compressed);
                    gunzip.end();
                });

                // Parse JSON - the dump is an object keyed by hotel ID
                let hotelReviewData = null;
                try {
                    const parsed = JSON.parse(decompressed);
                    console.log('[Reviews] Parsed dump with', Object.keys(parsed).length, 'hotels');

                    // Cache the entire dump
                    reviewsCache.data = parsed;
                    reviewsCache.lastFetch = now;

                    // Look up reviews by hotel ID - try different ID formats
                    hotelReviewData = parsed[hotelId] || parsed[hid];

                    // Also try without prefix if not found
                    if (!hotelReviewData && hotelId) {
                        // Try variations of the hotel ID
                        const idVariations = [
                            hotelId,
                            hotelId.replace('test_hotel_', ''),
                            hotelId.replace('las_vegas_hotel_', ''),
                            hotelId.split('_').pop()
                        ];

                        for (const idVar of idVariations) {
                            if (parsed[idVar]) {
                                hotelReviewData = parsed[idVar];
                                console.log('[Reviews] Found hotel with ID variation:', idVar);
                                break;
                            }
                        }
                    }

                    if (hotelReviewData) {
                        console.log('[Reviews] Found hotel data:', {
                            hid: hotelReviewData.hid,
                            rating: hotelReviewData.rating,
                            reviewCount: hotelReviewData.reviews?.length || 0
                        });
                    } else {
                        console.log('[Reviews] Hotel not found in dump. Available sample IDs:', Object.keys(parsed).slice(0, 10));
                    }
                } catch (parseErr) {
                    console.log('[Reviews] JSON parse error:', parseErr.message);
                }

                // Extract and format reviews for this hotel
                const hotelReviews = hotelReviewData?.reviews || [];

                if (hotelReviews.length > 0) {
                    // Log sample review structure for debugging
                    if (hotelReviews[0]) {
                        console.log('[Reviews] Sample review fields:', Object.keys(hotelReviews[0]));
                        console.log('[Reviews] Sample review:', JSON.stringify(hotelReviews[0]).substring(0, 500));
                    }

                    const formattedReviews = formatReviews(hotelReviews);
                    return res.json({
                        success: true,
                        reviews: formattedReviews,
                        total: formattedReviews.length,
                        rating: hotelReviewData?.rating,
                        detailedRatings: hotelReviewData?.detailed_ratings,
                        source: 'dump'
                    });
                }
            }
        } catch (dumpErr) {
            console.log('[Reviews] Error fetching reviews dump:', dumpErr.message);
        }

        // If no reviews found, return empty
        res.json({
            success: true,
            reviews: [],
            total: 0,
            source: 'none',
            message: 'No reviews found for this hotel'
        });

    } catch (error) {
        console.error('[Reviews Error]', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper function to format reviews
function formatReviews(reviews) {
    return reviews.slice(0, 50).map((review, index) => {
        // Map traveller_type to readable format
        const travellerTypeMap = {
            'solo_travel': 'Solo traveler',
            'couple': 'Couple',
            'family': 'Family',
            'friends': 'Friends',
            'business': 'Business'
        };

        // Map trip_type to readable format
        const tripTypeMap = {
            'business': 'Business trip',
            'leisure': 'Leisure trip',
            'vacation': 'Vacation'
        };

        return {
            id: review.id || index,
            rating: review.rating || 8,
            title: null,
            text: null, // Reviews dump doesn't include free-form text
            userName: review.author || 'Guest',
            userAvatar: null,
            date: review.created || null,
            pros: review.review_plus || null,
            cons: review.review_minus || null,
            travelType: tripTypeMap[review.trip_type] || review.trip_type || null,
            travellerType: travellerTypeMap[review.traveller_type] || review.traveller_type || null,
            roomType: review.room_name || null,
            nights: review.nights || null,
            guests: review.adults ? `${review.adults} adult${review.adults > 1 ? 's' : ''}${review.children > 0 ? `, ${review.children} child${review.children > 1 ? 'ren' : ''}` : ''}` : null,
            images: review.images || [],
            detailedRatings: review.detailed || null
        };
    });
}

/**
 * POST /api/hotels/booking/form
 * Create booking process - first step in the booking flow
 *
 * Required by RateHawk before starting the actual booking
 * Body: { book_hash: string, language?: string }
 * Returns: { order_id, partner_order_id, item_id, payment_types, ... }
 */
router.post('/booking/form', async (req, res) => {
    try {
        const { book_hash, match_hash, language = 'en' } = req.body;

        // book_hash or match_hash from the rate selection
        const rateHash = book_hash || match_hash;

        if (!rateHash) {
            return res.status(400).json({
                success: false,
                error: 'book_hash or match_hash is required'
            });
        }

        // Generate unique partner_order_id
        const partner_order_id = `zanafly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Get user IP from request (for credit card processing)
        const user_ip = req.headers['x-forwarded-for']?.split(',')[0] ||
                       req.headers['x-real-ip'] ||
                       req.connection?.remoteAddress ||
                       req.socket?.remoteAddress ||
                       '127.0.0.1';

        console.log('[Booking Form] Creating booking process:', {
            partner_order_id,
            book_hash: rateHash,
            user_ip: user_ip.replace('::ffff:', '') // Clean IPv6 prefix
        });

        const response = await callRateHawkAPI('/hotel/order/booking/form/', {
            partner_order_id,
            book_hash: rateHash,
            language,
            user_ip: user_ip.replace('::ffff:', '')
        });

        console.log('[Booking Form] Response:', JSON.stringify(response, null, 2));

        if (response.status === 'ok' && response.data) {
            return res.json({
                success: true,
                data: {
                    order_id: response.data.order_id,
                    partner_order_id: response.data.partner_order_id,
                    item_id: response.data.item_id,
                    payment_types: response.data.payment_types || [],
                    is_gender_required: response.data.is_gender_specification_required || false,
                    upsell_data: response.data.upsell_data || []
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                error: response.error || 'Failed to create booking form',
                details: response
            });
        }
    } catch (error) {
        console.error('[Booking Form Error]', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.error || error.message,
            details: error.response?.data
        });
    }
});

/**
 * POST /api/hotels/booking/finish
 * Start/Finish the booking process with guest details
 * Calls RateHawk /hotel/order/booking/finish/ API
 *
 * Body: {
 *   partner_order_id: string (from booking form),
 *   guests: [{ first_name, last_name, is_child?, age?, gender? }],
 *   user: { email, phone, comment? },
 *   payment: { type: 'deposit', amount: string, currency: 'USD' },
 *   rooms_count: number,
 *   stripe_payment_id?: string (for our records)
 * }
 */
router.post('/booking/finish', async (req, res) => {
    try {
        const {
            partner_order_id,
            guests,
            user,
            payment,
            rooms_count = 1,
            language = 'en',
            arrival_datetime,
            stripe_payment_id
        } = req.body;

        // Validation
        if (!partner_order_id) {
            return res.status(400).json({
                success: false,
                error: 'partner_order_id is required'
            });
        }

        if (!guests || !Array.isArray(guests) || guests.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one guest is required'
            });
        }

        if (!user?.email || !user?.phone) {
            return res.status(400).json({
                success: false,
                error: 'User email and phone are required'
            });
        }

        if (!payment?.amount || !payment?.currency) {
            return res.status(400).json({
                success: false,
                error: 'Payment amount and currency are required'
            });
        }

        // Format guests into rooms array for RateHawk API
        // Each room needs at least one guest with first_name and last_name
        const roomsData = [];
        const guestsPerRoom = Math.ceil(guests.length / rooms_count);

        for (let i = 0; i < rooms_count; i++) {
            const roomGuests = guests.slice(i * guestsPerRoom, (i + 1) * guestsPerRoom);
            if (roomGuests.length === 0) {
                // Ensure at least one guest per room
                roomGuests.push(guests[0]);
            }
            roomsData.push({
                guests: roomGuests.map(g => ({
                    first_name: g.first_name || g.firstName,
                    last_name: g.last_name || g.lastName,
                    ...(g.is_child && { is_child: true }),
                    ...(g.age && { age: parseInt(g.age) }),
                    ...(g.gender && { gender: g.gender })
                }))
            });
        }

        console.log('[Booking Finish] Starting booking:', {
            partner_order_id,
            rooms: roomsData.length,
            total_guests: guests.length,
            payment_type: payment.type || 'deposit',
            amount: payment.amount,
            currency: payment.currency
        });

        // Build the request body for RateHawk
        const requestBody = {
            partner: {
                partner_order_id,
                ...(stripe_payment_id && { comment: `Stripe Payment: ${stripe_payment_id}` })
            },
            language,
            rooms: roomsData,
            user: {
                email: user.email,
                phone: user.phone,
                ...(user.comment && { comment: user.comment })
            },
            payment_type: {
                type: payment.type || 'deposit', // Using deposit since we handle payment via Stripe
                amount: String(payment.amount),
                currency_code: payment.currency || 'USD'
            }
        };

        // Add optional fields
        if (arrival_datetime) {
            requestBody.arrival_datetime = arrival_datetime;
        }

        // Add supplier_data if needed (contact details of user who initiated booking)
        if (user.firstName && user.lastName) {
            requestBody.supplier_data = {
                first_name_original: user.firstName || guests[0]?.first_name,
                last_name_original: user.lastName || guests[0]?.last_name,
                email: user.email,
                phone: user.phone
            };
        }

        console.log('[Booking Finish] Request body:', JSON.stringify(requestBody, null, 2));

        const response = await callRateHawkAPI('/hotel/order/booking/finish/', requestBody);

        console.log('[Booking Finish] Response:', JSON.stringify(response, null, 2));

        if (response.status === 'ok') {
            return res.json({
                success: true,
                message: 'Booking submitted successfully',
                data: {
                    partner_order_id,
                    status: 'processing',
                    stripe_payment_id
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                error: response.error || 'Booking failed',
                details: response
            });
        }
    } catch (error) {
        console.error('[Booking Finish Error]', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.error || error.message,
            details: error.response?.data
        });
    }
});

/**
 * POST /api/hotels/booking/status
 * Check booking status
 * Calls RateHawk /hotel/order/booking/finish/status/ API
 *
 * Body: { partner_order_id: string }
 *
 * RateHawk status values:
 * - ok: booking finished successfully
 * - processing: booking still in progress (poll every 5 seconds)
 * - 3ds: needs 3D Secure check (only for "now" payment type)
 * - error: booking failed
 */
router.post('/booking/status', async (req, res) => {
    try {
        const { partner_order_id } = req.body;

        if (!partner_order_id) {
            return res.status(400).json({
                success: false,
                error: 'partner_order_id is required'
            });
        }

        console.log('[Booking Status] Checking status for:', partner_order_id);

        const response = await callRateHawkAPI('/hotel/order/booking/finish/status/', {
            partner_order_id
        });

        console.log('[Booking Status] Response:', JSON.stringify(response, null, 2));

        // Status is at root level: response.status (ok, processing, 3ds, error)
        const bookingStatus = response.status;

        if (bookingStatus === 'ok') {
            // Booking completed successfully
            return res.json({
                success: true,
                data: {
                    partner_order_id: response.data?.partner_order_id || partner_order_id,
                    status: 'ok',
                    percent: response.data?.percent || 100,
                    ...response.data
                }
            });
        } else if (bookingStatus === 'processing') {
            // Booking still in progress - client should poll again
            return res.json({
                success: true,
                data: {
                    partner_order_id: response.data?.partner_order_id || partner_order_id,
                    status: 'processing',
                    percent: response.data?.percent || 0
                }
            });
        } else if (bookingStatus === '3ds') {
            // 3D Secure check required (only for "now" payment type)
            return res.json({
                success: true,
                data: {
                    partner_order_id: response.data?.partner_order_id || partner_order_id,
                    status: '3ds',
                    data_3ds: response.data?.data_3ds,
                    percent: response.data?.percent || 0
                }
            });
        } else if (bookingStatus === 'error' || response.error) {
            // Booking failed
            return res.json({
                success: false,
                data: {
                    partner_order_id,
                    status: 'error'
                },
                error: response.error || 'Booking failed'
            });
        } else {
            // Unknown status
            return res.json({
                success: true,
                data: {
                    partner_order_id,
                    status: bookingStatus || 'unknown',
                    ...response.data
                }
            });
        }
    } catch (error) {
        console.error('[Booking Status Error]', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.error || error.message
        });
    }
});

/**
 * POST /api/hotels/bookings
 * Retrieve bookings from RateHawk
 * Calls RateHawk /hotel/order/info/ API
 *
 * Body: {
 *   status?: string ('cancelled' | 'completed' | 'failed' | 'noshow' | 'rejected'),
 *   page_size?: number (1-50, default 10),
 *   page_number?: number (default 1),
 *   ordering_by?: string ('created_at' | 'checkin_at' | 'checkout_at' | 'modified_at'),
 *   ordering_type?: string ('asc' | 'desc'),
 *   created_from?: string (ISO date),
 *   created_to?: string (ISO date),
 *   checkin_from?: string (YYYY-MM-DD),
 *   checkin_to?: string (YYYY-MM-DD),
 *   partner_order_ids?: string[],
 *   order_ids?: number[]
 * }
 */
router.post('/bookings', async (req, res) => {
    try {
        const {
            status,
            page_size = 10,
            page_number = 1,
            ordering_by = 'created_at',
            ordering_type = 'desc',
            created_from,
            created_to,
            checkin_from,
            checkin_to,
            partner_order_ids,
            order_ids,
            language = 'en'
        } = req.body;

        // Build the request body for RateHawk
        const requestBody = {
            ordering: {
                ordering_type,
                ordering_by
            },
            pagination: {
                page_size: String(Math.min(Math.max(1, page_size), 50)),
                page_number: String(Math.max(1, page_number))
            },
            language
        };

        // Add search filters if provided
        const search = {};

        if (status) {
            search.status = status;
        }

        if (created_from || created_to) {
            search.created_at = {};
            if (created_from) search.created_at.from_date = created_from;
            if (created_to) search.created_at.to_date = created_to;
        }

        if (checkin_from || checkin_to) {
            search.checkin_at = {};
            if (checkin_from) search.checkin_at.from_date = checkin_from;
            if (checkin_to) search.checkin_at.to_date = checkin_to;
        }

        if (partner_order_ids && partner_order_ids.length > 0) {
            search.partner_order_ids = partner_order_ids;
        }

        if (order_ids && order_ids.length > 0) {
            search.order_ids = order_ids;
        }

        // Only add search if we have filters
        if (Object.keys(search).length > 0) {
            requestBody.search = search;
        }

        console.log('[Bookings] Retrieving bookings with params:', JSON.stringify(requestBody, null, 2));

        const response = await callRateHawkAPI('/hotel/order/info/', requestBody);

        console.log('[Bookings] Response status:', response.status);

        if (response.status === 'ok' && response.data) {
            const {
                current_page_number,
                total_orders,
                total_pages,
                found_orders,
                found_pages,
                orders = []
            } = response.data;

            // Transform orders to a cleaner format for frontend
            const transformedOrders = orders.map(order => ({
                // Basic order info
                order_id: order.order_id,
                partner_order_id: order.partner_data?.order_id,
                status: order.status,
                order_type: order.order_type,
                source: order.source,

                // Dates
                created_at: order.created_at,
                modified_at: order.modified_at,
                cancelled_at: order.cancelled_at,
                checkin_at: order.checkin_at,
                checkout_at: order.checkout_at,

                // Stay details
                nights: order.nights,
                roomnights: order.roomnights,

                // Hotel info
                hotel: {
                    id: order.hotel_data?.id,
                    hid: order.hotel_data?.hid,
                    confirmation_id: order.hotel_data?.order_id
                },

                // Room and guest details
                rooms: (order.rooms_data || []).map(room => ({
                    room_name: room.room_name,
                    room_idx: room.room_idx,
                    bedding: room.bedding_name,
                    meal: room.meal_name,
                    has_breakfast: room.has_breakfast,
                    guests: room.guest_data?.guests || [],
                    adults: room.guest_data?.adults_number || 0,
                    children: room.guest_data?.children_number || 0
                })),

                // Pricing
                amount_payable: order.amount_payable,
                amount_sell: order.amount_sell,
                amount_refunded: order.amount_refunded,
                currency: order.amount_payable?.currency_code || order.amount_sell?.currency_code || 'USD',

                // Cancellation info
                cancellation_info: {
                    is_cancellable: order.is_cancellable,
                    free_cancellation_before: order.cancellation_info?.free_cancellation_before,
                    policies: order.cancellation_info?.policies || []
                },

                // User info
                user: {
                    email: order.user_data?.email,
                    comment: order.user_data?.user_comment,
                    arrival_datetime: order.user_data?.arrival_datetime
                },

                // Payment info
                payment: {
                    type: order.payment_data?.payment_type,
                    paid_at: order.payment_data?.paid_at,
                    payment_due: order.payment_data?.payment_due,
                    payment_pending: order.payment_data?.payment_pending
                },

                // Supplier info
                supplier: {
                    name: order.supplier_data?.name,
                    confirmation_id: order.supplier_data?.confirmation_id,
                    order_id: order.supplier_data?.order_id
                },

                // Taxes
                taxes: order.taxes || [],

                // Partner comment
                partner_comment: order.partner_data?.order_comment
            }));

            return res.json({
                success: true,
                data: {
                    current_page: current_page_number,
                    total_orders,
                    total_pages,
                    found_orders,
                    found_pages,
                    orders: transformedOrders
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                error: response.error || 'Failed to retrieve bookings',
                details: response
            });
        }
    } catch (error) {
        console.error('[Bookings Error]', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.error || error.message
        });
    }
});

/**
 * POST /api/hotels/booking/order
 * Get details for a specific booking by partner_order_id
 *
 * Body: { partner_order_id: string }
 */
router.post('/booking/order', async (req, res) => {
    try {
        const { partner_order_id, order_id } = req.body;

        if (!partner_order_id && !order_id) {
            return res.status(400).json({
                success: false,
                error: 'partner_order_id or order_id is required'
            });
        }

        console.log('[Booking Order] Fetching order:', partner_order_id || order_id);

        // Build search params
        const requestBody = {
            ordering: {
                ordering_type: 'desc',
                ordering_by: 'created_at'
            },
            pagination: {
                page_size: '1',
                page_number: '1'
            },
            search: {},
            language: 'en'
        };

        if (partner_order_id) {
            requestBody.search.partner_order_ids = [partner_order_id];
        } else if (order_id) {
            requestBody.search.order_ids = [parseInt(order_id)];
        }

        const response = await callRateHawkAPI('/hotel/order/info/', requestBody);

        if (response.status === 'ok' && response.data?.orders?.length > 0) {
            const order = response.data.orders[0];

            return res.json({
                success: true,
                data: {
                    order_id: order.order_id,
                    partner_order_id: order.partner_data?.order_id,
                    status: order.status,
                    order_type: order.order_type,
                    created_at: order.created_at,
                    checkin_at: order.checkin_at,
                    checkout_at: order.checkout_at,
                    nights: order.nights,
                    hotel: {
                        id: order.hotel_data?.id,
                        hid: order.hotel_data?.hid,
                        confirmation_id: order.supplier_data?.confirmation_id
                    },
                    rooms: order.rooms_data,
                    amount_payable: order.amount_payable,
                    amount_sell: order.amount_sell,
                    is_cancellable: order.is_cancellable,
                    cancellation_info: order.cancellation_info,
                    user: order.user_data,
                    payment: order.payment_data,
                    supplier: order.supplier_data
                }
            });
        } else {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            });
        }
    } catch (error) {
        console.error('[Booking Order Error]', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.error || error.message
        });
    }
});

/**
 * POST /api/hotels/booking/cancel
 * Cancel a booking
 * Calls RateHawk /hotel/order/cancel/ API
 *
 * Body: { partner_order_id: string }
 *
 * RateHawk Error Codes:
 * - order_not_found: Order not found or finished with non-completed status
 * - order_not_cancellable: Stay has started or no permission for non-refundable
 * - sandbox_restriction: Trying to cancel real hotel in test environment
 * - lock: Duplicate request within short time
 * - unknown: Other errors
 *
 * Response on success:
 * - amount_payable: Cancellation fee amount
 * - amount_refunded: Refunded amount
 * - amount_sell: Original booking amount
 */
router.post('/booking/cancel', async (req, res) => {
    try {
        const { partner_order_id } = req.body;

        if (!partner_order_id) {
            return res.status(400).json({
                success: false,
                error: 'partner_order_id is required'
            });
        }

        console.log('[Booking Cancel] Cancelling booking:', partner_order_id);

        const response = await callRateHawkAPI('/hotel/order/cancel/', {
            partner_order_id
        });

        console.log('[Booking Cancel] Response:', JSON.stringify(response, null, 2));

        if (response.status === 'ok' && response.data) {
            // Extract cancellation details
            const { amount_payable, amount_refunded, amount_sell } = response.data;

            return res.json({
                success: true,
                message: 'Booking cancelled successfully',
                data: {
                    partner_order_id,
                    // Cancellation fee (what customer still owes)
                    cancellation_fee: amount_payable ? {
                        amount: parseFloat(amount_payable.amount || 0),
                        currency: amount_payable.currency_code || 'EUR'
                    } : null,
                    // Amount refunded to customer
                    refunded: amount_refunded ? {
                        amount: parseFloat(amount_refunded.amount || 0),
                        currency: amount_refunded.currency_code || 'EUR'
                    } : null,
                    // Original booking amount
                    original_amount: amount_sell ? {
                        amount: parseFloat(amount_sell.amount || 0),
                        currency: amount_sell.currency_code || 'EUR'
                    } : null
                }
            });
        } else {
            // Handle specific RateHawk error codes
            const errorCode = response.error;
            let userFriendlyMessage = 'Failed to cancel booking';

            switch (errorCode) {
                case 'order_not_found':
                    userFriendlyMessage = 'Booking not found or already processed';
                    break;
                case 'order_not_cancellable':
                    userFriendlyMessage = 'This booking cannot be cancelled. The stay period may have started or cancellation is not permitted.';
                    break;
                case 'sandbox_restriction':
                    userFriendlyMessage = 'Cannot cancel this booking in the current environment';
                    break;
                case 'lock':
                    userFriendlyMessage = 'Please wait a moment before trying again';
                    break;
                case 'unknown':
                default:
                    userFriendlyMessage = errorCode || 'An error occurred while cancelling the booking';
            }

            return res.status(400).json({
                success: false,
                error: userFriendlyMessage,
                error_code: errorCode,
                details: response
            });
        }
    } catch (error) {
        console.error('[Booking Cancel Error]', error.response?.data || error.message);

        // Handle axios error response
        const errorData = error.response?.data;
        let userFriendlyMessage = 'Failed to cancel booking';

        if (errorData?.error) {
            switch (errorData.error) {
                case 'order_not_found':
                    userFriendlyMessage = 'Booking not found or already processed';
                    break;
                case 'order_not_cancellable':
                    userFriendlyMessage = 'This booking cannot be cancelled';
                    break;
                case 'sandbox_restriction':
                    userFriendlyMessage = 'Cannot cancel this booking in the current environment';
                    break;
                case 'lock':
                    userFriendlyMessage = 'Please wait a moment before trying again';
                    break;
                default:
                    userFriendlyMessage = errorData.error;
            }
        }

        res.status(500).json({
            success: false,
            error: userFriendlyMessage,
            error_code: errorData?.error || 'unknown'
        });
    }
});

export default router;
