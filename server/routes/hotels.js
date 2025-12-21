import express from 'express';
import axios from 'axios';
import { getSettings } from '../config/store.js';

const router = express.Router();

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

        // Process images - replace {size} placeholder
        const processImage = (url) => {
            if (!url) return null;
            return url
                .replace(/\{size\}/g, '1024x768')
                .replace(/t\{size\}/g, '1024x768')
                .replace(/^http:\/\//, 'https://');
        };

        const images = (hotel.images || []).map(img => {
            if (typeof img === 'string') return processImage(img);
            return processImage(img?.url);
        }).filter(Boolean);

        // Extract amenities
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

        // Build clean response
        const cleanHotel = {
            id: hotel.id,
            hid: hotel.hid,
            name: hotel.name,
            address: hotel.address,
            city: hotel.city,
            country: hotel.country,
            star_rating: hotel.star_rating,
            review_score: hotel.review_score,
            reviews_count: hotel.reviews_count,
            latitude: hotel.latitude,
            longitude: hotel.longitude,
            description: hotel.description,
            images: images.length > 0 ? images : [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'
            ],
            amenities,
            check_in_time: hotel.check_in_time,
            check_out_time: hotel.check_out_time,
            front_desk_time_start: hotel.front_desk_time_start,
            front_desk_time_end: hotel.front_desk_time_end,
            kind: hotel.kind,
            phone: hotel.phone,
            email: hotel.email
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

export default router;
