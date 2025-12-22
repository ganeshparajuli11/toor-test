import api from './api.service';

/**
 * RateHawk (ETG) API v3 Service
 * Enhanced with better error handling, retry logic, and image processing
 */

// Image size templates for RateHawk
const IMAGE_SIZES = {
  thumbnail: '240x240',
  small: '320x240',
  medium: '640x480',
  large: '1024x768',
  xlarge: '1920x1080'
};

// Default fallback images
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop'
];

class RateHawkService {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  /**
   * Process RateHawk image URL - replace {size} placeholder
   * @param {string} url - Image URL with potential {size} placeholder
   * @param {string} size - Desired size (thumbnail, small, medium, large, xlarge)
   * @returns {string} - Processed URL
   */
  processImageUrl(url, size = 'large') {
    if (!url || typeof url !== 'string') {
      return this.getRandomFallbackImage();
    }

    // Replace {size} placeholder with actual dimensions
    let processedUrl = url.replace(/\{size\}/g, IMAGE_SIZES[size] || IMAGE_SIZES.large);

    // Handle t{size} format (common in RateHawk)
    processedUrl = processedUrl.replace(/t\{size\}/g, IMAGE_SIZES[size] || IMAGE_SIZES.large);

    // Ensure HTTPS
    if (processedUrl.startsWith('http://')) {
      processedUrl = processedUrl.replace('http://', 'https://');
    }

    return processedUrl;
  }

  /**
   * Get random fallback image
   */
  getRandomFallbackImage() {
    return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
  }

  /**
   * Retry wrapper for API calls
   */
  async withRetry(fn, attempts = this.retryAttempts) {
    let lastError;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${i + 1} failed:`, error.message);
        if (i < attempts - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
        }
      }
    }
    throw lastError;
  }

  /**
   * Search for hotels using clean /api/hotels/search endpoint
   * @param {Object} params - Search parameters
   */
  async searchHotels(params) {
    try {
      // Format guests for API
      const guests = [];
      const roomCount = params.rooms || 1;
      const adultsPerRoom = Math.ceil((params.guests || 2) / roomCount);

      for (let i = 0; i < roomCount; i++) {
        guests.push({
          adults: adultsPerRoom,
          children: []
        });
      }

      const searchParams = {
        region_id: Number(params.destination),
        checkin: params.checkIn,
        checkout: params.checkOut,
        guests: guests,
        currency: params.currency || 'USD',
        language: 'en',
        residency: 'us'
      };

      console.log('[RateHawk Service] Starting hotel search...', searchParams);

      // Use new clean endpoint
      const response = await this.withRetry(() =>
        api.post('/hotels/search', searchParams)
      );

      console.log('[RateHawk Service] Search response:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Search failed');
      }

      const hotels = response.data.hotels || [];
      console.log(`[RateHawk Service] Found ${hotels.length} hotels`);

      if (hotels.length === 0) {
        return [];
      }

      // Enrich top hotels with full details
      const enrichedHotels = await this.enrichHotelsWithDetails(hotels);
      return enrichedHotels;
    } catch (error) {
      console.error('[RateHawk Service] Hotel search error:', error);
      throw error;
    }
  }

  /**
   * Fetch details for a list of hotels and merge them
   * Uses Promise.allSettled to ensure all results are returned even if some fail
   * @private
   */
  async enrichHotelsWithDetails(hotels) {
    try {
      const topHotels = hotels.slice(0, 15);
      console.log(`[RateHawk Service] Enriching ${topHotels.length} hotels with details...`);

      // Use Promise.allSettled to handle partial failures gracefully
      const detailsPromises = topHotels.map(async (hotel, index) => {
        try {
          // Small stagger to avoid overwhelming the API
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 50 * index));
          }

          console.log(`[RateHawk Service] Fetching info for hotel: ${hotel.id}`);

          const infoResponse = await api.post('/hotels/info', {
            id: hotel.id,
            language: 'en'
          });

          if (infoResponse.data?.success && infoResponse.data?.hotel) {
            const info = infoResponse.data.hotel;
            const hotelName = info.name || this.formatHotelIdAsName(hotel.id);

            console.log(`[RateHawk Service] Got info for: ${hotelName}`);

            // Merge hotel info with search result, preserving best_offer from search
            return {
              id: hotel.id,
              hid: hotel.hid || info.hid,
              name: hotelName,
              location: info.address ? `${info.address}${info.city ? `, ${info.city}` : ''}` : (info.city || 'Location'),
              address: info.address,
              city: info.city,
              country: info.country,
              rating: info.star_rating || 4,
              reviewScore: info.review_score || 8.5,
              reviews: info.reviews_count || 0,
              price: parseFloat(hotel.best_offer?.total_price) || 0,
              currency: hotel.best_offer?.currency || 'USD',
              description: info.description || `Experience luxury at ${hotelName}`,
              image: info.images?.[0] || this.getRandomFallbackImage(),
              images: info.images?.length > 0 ? info.images : [this.getRandomFallbackImage()],
              amenities: info.amenities?.length > 0 ? info.amenities : ['Free WiFi', 'Air Conditioning'],
              best_offer: hotel.best_offer,
              total_rates: hotel.total_rates
            };
          }

          console.warn(`[RateHawk Service] No info data for hotel ${hotel.id}, using basic transform`);
          return this.transformBasicHotel(hotel);
        } catch (err) {
          console.warn(`[RateHawk Service] Failed to fetch details for hotel ${hotel.id}:`, err.message);
          return this.transformBasicHotel(hotel);
        }
      });

      // Wait for all promises to settle (won't reject if some fail)
      const results = await Promise.all(detailsPromises);

      const successCount = results.filter(h => h.location !== 'Location not available').length;
      console.log(`[RateHawk Service] Enrichment complete: ${successCount}/${results.length} hotels with full details`);

      return results;
    } catch (error) {
      console.error('[RateHawk Service] Enrich hotels error:', error);
      return hotels.map(h => this.transformBasicHotel(h));
    }
  }

  /**
   * Convert hotel ID to readable name
   * e.g., "the_tower_o_pooman_hotel" -> "The Tower O Pooman Hotel"
   * @private
   */
  formatHotelIdAsName(id) {
    if (!id || typeof id !== 'string') return 'Hotel';

    return id
      .replace(/_/g, ' ')           // Replace underscores with spaces
      .replace(/\s+/g, ' ')          // Normalize multiple spaces
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Transform basic hotel data (when full details not available)
   * @private
   */
  transformBasicHotel(hotel) {
    // Create readable name from ID if name not available
    const hotelName = hotel.name || this.formatHotelIdAsName(hotel.id);

    return {
      id: hotel.id,
      hid: hotel.hid,
      name: hotelName,
      location: 'Location not available',
      rating: 4,
      reviewScore: 8.0,
      reviews: 0,
      price: parseFloat(hotel.best_offer?.total_price) || 0,
      currency: hotel.best_offer?.currency || 'USD',
      description: `Experience luxury at ${hotelName}`,
      image: this.getRandomFallbackImage(),
      images: [this.getRandomFallbackImage()],
      amenities: ['Free WiFi'],
      best_offer: hotel.best_offer,
      total_rates: hotel.total_rates
    };
  }

  /**
   * Get regions/cities/hotels for autocomplete
   * @param {string} query - Search query
   */
  async searchRegions(query) {
    try {
      // Use new clean endpoint
      const response = await this.withRetry(() =>
        api.post('/hotels/autocomplete', {
          query,
          language: 'en'
        })
      );

      console.log('[RateHawk Service] Autocomplete response:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'Autocomplete failed');
      }

      const regions = response.data.regions || [];
      const hotels = response.data.hotels || [];

      console.log(`[RateHawk Service] Found ${regions.length} regions and ${hotels.length} hotels for "${query}"`);

      return [
        ...regions.map(r => ({
          id: r.id,
          name: r.name,
          type: r.type || 'City',
          country_code: r.country_code,
          label: r.label
        })),
        ...hotels.map(h => ({
          id: h.region_id, // Use region_id for searches
          hotel_id: h.id || h.hid,
          name: h.name,
          type: 'Hotel',
          label: h.label
        }))
      ];
    } catch (error) {
      console.error('[RateHawk Service] Region search error:', error);
      return [];
    }
  }

  /**
   * Search for transfers
   */
  async searchTransfers(params) {
    try {
      console.log('Starting RateHawk transfer search...', params);
      const response = await api.post('/proxy/ratehawk/transfer/search/', {
        start_point: params.pickupLocation,
        end_point: params.dropoffLocation,
        date_time: params.pickupDate,
        passengers: params.passengers || 2,
        currency: 'USD',
        language: 'en'
      });

      return this.transformTransferResults(response.data?.data);
    } catch (error) {
      console.warn('Transfer search failed:', error.message);
      return [];
    }
  }

  /**
   * Search for flights
   */
  async searchFlights(params) {
    try {
      console.log('Starting RateHawk flight search...', params);
      const response = await api.post('/proxy/ratehawk/flight/search/', {
        from: params.from,
        to: params.to,
        departure_date: params.departure,
        return_date: params.return,
        passengers: {
          adults: params.adults,
          children: params.children,
          infants: params.infants
        },
        class: params.class,
        currency: 'USD'
      });

      return response.data?.data || [];
    } catch (error) {
      console.warn('Flight search failed:', error.message);
      return [];
    }
  }

  /**
   * Search for cruises (not supported by RateHawk)
   */
  async searchCruises(params) {
    return [];
  }

  /**
   * Get suggested hotels using multicomplete API
   * This is faster and returns hotels with actual names
   * Tries multiple queries if first one returns no results
   * @param {string} query - Search query (city name or keyword)
   */
  async getSuggestedHotels(query = 'hotel') {
    // List of queries to try - user's query first, then fallbacks
    const queriesToTry = [
      query,
      'hotel',      // Generic hotel search
      'Paris',      // Popular destination
      'London',     // Popular destination
      'New York'    // Popular destination
    ].filter((q, index, arr) => arr.indexOf(q) === index); // Remove duplicates

    for (const searchQuery of queriesToTry) {
      try {
        console.log(`[RateHawk Service] Getting suggested hotels for: ${searchQuery}`);

        const response = await api.post('/hotels/suggested', {
          query: searchQuery,
          language: 'en'
        });

        if (response.data?.success && response.data?.hotels && response.data.hotels.length > 0) {
          console.log(`[RateHawk Service] Got ${response.data.hotels.length} suggested hotels for "${searchQuery}"`);
          return response.data.hotels;
        }

        console.log(`[RateHawk Service] No hotels found for "${searchQuery}", trying next query...`);
      } catch (error) {
        console.error(`[RateHawk Service] Error getting suggested hotels for "${searchQuery}":`, error.message);
      }
    }

    console.warn('[RateHawk Service] No suggested hotels found for any query');
    return [];
  }

  /**
   * Get recommended hotels for homepage
   * @param {string} city - City name to search for hotels (default: Paris)
   */
  async getRecommendedHotels(city = 'Paris') {
    try {
      console.log(`Fetching recommended hotels for: ${city}`);
      const regions = await this.searchRegions(city);

      // Prefer City type, then any region type
      const targetRegion = regions.find(r => r.type === 'City')
        || regions.find(r => r.type !== 'Hotel')
        || regions[0];

      if (!targetRegion) {
        console.warn(`No region found for ${city}, using fallback`);
        return [];
      }

      console.log(`Found region: ${targetRegion.label} (ID: ${targetRegion.id}, Type: ${targetRegion.type})`);

      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const weekAfter = new Date(nextWeek);
      weekAfter.setDate(nextWeek.getDate() + 3);

      const hotels = await this.searchHotels({
        destination: targetRegion.id,
        checkIn: nextWeek.toISOString().split('T')[0],
        checkOut: weekAfter.toISOString().split('T')[0],
        guests: 2,
        rooms: 1
      });

      console.log(`Got ${hotels.length} hotels for homepage`);

      // Transform for homepage display format
      return hotels.slice(0, 8).map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        location: hotel.location || city,
        price: hotel.price || 0,
        rating: hotel.rating || 4.0,
        img: hotel.image,
        amenities: hotel.amenities || []
      }));
    } catch (error) {
      console.error('Get recommended hotels error:', error);
      return [];
    }
  }

  /**
   * Transform transfer search results
   * @private
   */
  transformTransferResults(data) {
    if (!data || !data.transfers) return [];

    return data.transfers.map(transfer => ({
      id: transfer.id,
      name: transfer.vehicle_class_name || 'Standard Car',
      category: transfer.vehicle_class || 'Standard',
      image: this.processImageUrl(transfer.image_url),
      passengers: transfer.capacity || 4,
      luggage: transfer.luggage_capacity || 2,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      provider: 'RateHawk Transfer',
      rating: 4.5,
      reviews: 0,
      price: transfer.price?.amount || 0,
      features: ['Meet & Greet', 'Free Cancellation']
    }));
  }

  /**
   * Extract and process images from hotel data
   * @private
   */
  extractImages(hotel) {
    let images = [];

    // Try different image sources
    if (hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0) {
      images = hotel.images.map(img => {
        if (typeof img === 'string') return this.processImageUrl(img);
        if (img.url) return this.processImageUrl(img.url);
        return null;
      }).filter(Boolean);
    }

    if (images.length === 0 && hotel.photos && Array.isArray(hotel.photos)) {
      images = hotel.photos.map(photo => {
        if (typeof photo === 'string') return this.processImageUrl(photo);
        if (photo.url) return this.processImageUrl(photo.url);
        return null;
      }).filter(Boolean);
    }

    if (images.length === 0 && hotel.thumbnail) {
      images = [this.processImageUrl(hotel.thumbnail)];
    }

    // Return first image or fallback
    return images.length > 0 ? images : [this.getRandomFallbackImage()];
  }

  /**
   * Transform RateHawk hotel search results to app format
   * @private
   */
  transformHotelSearchResults(response) {
    if (!response || !response.hotels) {
      return [];
    }

    return response.hotels.map(hotel => {
      // Extract price from rates - RateHawk returns rates[].payment_options.payment_types[].show_amount
      let price = hotel.min_price;
      let currency = 'USD';

      if (!price && hotel.rates && Array.isArray(hotel.rates) && hotel.rates.length > 0) {
        const amounts = hotel.rates.map(r => {
          const payment = r.payment_options?.payment_types?.[0];
          if (payment) {
            currency = payment.show_currency_code || 'USD';
            return parseFloat(payment.show_amount || payment.amount) || Infinity;
          }
          return Infinity;
        });
        if (amounts.length > 0) {
          price = Math.min(...amounts.filter(a => a !== Infinity));
        }
        if (!price || price === Infinity) price = 0;
      }

      // For per-night price, divide by number of nights if daily_prices available
      if (hotel.rates?.[0]?.daily_prices?.length > 0) {
        const dailyPrices = hotel.rates[0].daily_prices;
        const avgDaily = dailyPrices.reduce((sum, p) => sum + parseFloat(p), 0) / dailyPrices.length;
        if (avgDaily > 0) {
          price = Math.round(avgDaily);
        }
      }

      // Process images
      const images = this.extractImages(hotel);
      const mainImage = images[0];

      // Build location string
      const locationParts = [];
      if (hotel.address) locationParts.push(hotel.address);
      else if (hotel.city) locationParts.push(hotel.city);
      if (hotel.country) locationParts.push(hotel.country);
      const location = locationParts.join(', ') || 'Dubai, UAE'; // Default for Dubai search

      return {
        id: hotel.id || hotel.hid,
        name: hotel.name || hotel.id,
        location: location,
        address: hotel.address,
        rating: hotel.star_rating || (hotel.review_score ? hotel.review_score / 2 : 4.0),
        reviewScore: hotel.review_score || 8.5,
        reviews: hotel.reviews_count || hotel.review_count || 0,
        totalRooms: hotel.room_count || 0,
        availableRooms: hotel.rates?.length || 1,
        price: price || 0,
        currency: currency,
        description: hotel.description || `Experience luxury at ${hotel.name || 'this property'}`,
        starRating: hotel.star_rating || 4,
        status: 'Active',
        amenities: hotel.amenities || ['Free WiFi', 'Air Conditioning', 'Pool'],
        image: mainImage,
        images: images,
        bookings: 0,
        revenue: 0,
        rateHawkData: hotel
      };
    });
  }

  /**
   * Transform hotel details to app format
   * Backend already processes images and extracts data, so use directly
   * @private
   */
  transformHotelDetails(response) {
    const hotel = response.hotel || response;

    // Backend already processes images - use directly or fallback
    let images = [];
    if (hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0) {
      images = hotel.images;
    } else {
      images = [this.getRandomFallbackImage()];
    }

    // Backend already extracts description as array
    let description = [];
    if (hotel.description) {
      if (Array.isArray(hotel.description)) {
        description = hotel.description;
      } else if (typeof hotel.description === 'string') {
        description = [hotel.description];
      }
    }
    if (description.length === 0) {
      description = ['No description available for this property.'];
    }

    // Backend already provides flat amenities array
    let amenities = [];
    if (hotel.amenities && Array.isArray(hotel.amenities)) {
      amenities = hotel.amenities.map(a => typeof a === 'string' ? a : (a.name || a.title || ''));
    }
    if (amenities.length === 0) {
      amenities = ['Free WiFi', 'Air Conditioning'];
    }

    // Backend provides location string already built
    const location = hotel.location || hotel.address || 'Location not available';

    // Format check-in/out times
    const formatTime = (time) => {
      if (!time) return null;
      // Remove seconds if present (15:00:00 -> 15:00)
      const parts = time.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
      return time;
    };

    return {
      id: hotel.id,
      hid: hotel.hid,
      name: hotel.name || 'Hotel',
      location: location,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      rating: hotel.star_rating || 0,
      reviewScore: hotel.review_score ? Math.round(hotel.review_score * 10) / 10 : 0,
      reviewCount: hotel.reviews_count || 0,
      price: hotel.min_price || 0,
      description: description,
      images: images,
      amenities: amenities,
      tags: hotel.kind ? [hotel.kind] : [],
      overallRating: hotel.star_rating || 0,
      totalReviews: hotel.reviews_count || 0,
      // Check-in/out times from API
      checkInTime: formatTime(hotel.check_in_time),
      checkOutTime: formatTime(hotel.check_out_time),
      frontDeskStart: formatTime(hotel.front_desk_time_start),
      frontDeskEnd: formatTime(hotel.front_desk_time_end),
      // Room groups from hotel info (used when rates API not available)
      roomGroups: hotel.room_groups || [],
      // Property type
      propertyType: hotel.kind || 'Hotel',
      // Contact info
      phone: hotel.phone,
      email: hotel.email,
      // Additional info
      hotelChain: hotel.hotel_chain,
      postalCode: hotel.postal_code,
      // Rating breakdown (estimate based on overall)
      ratingBreakdown: hotel.star_rating ? {
        'Staff/service': Math.min(5, hotel.star_rating + 0.3),
        'Location': Math.min(5, hotel.star_rating + 0.1),
        'Amenities': Math.min(5, hotel.star_rating),
        'Hospitality': Math.min(5, hotel.star_rating + 0.2),
        'Cleanliness': Math.min(5, hotel.star_rating + 0.3),
      } : null,
      // Map embed URL
      mapEmbedUrl: hotel.latitude && hotel.longitude
        ? `https://maps.google.com/maps?q=${hotel.latitude},${hotel.longitude}&z=15&output=embed`
        : null,
      coordinates: {
        latitude: hotel.latitude,
        longitude: hotel.longitude
      },
      // Keep raw data for debugging
      rateHawkData: hotel
    };
  }

  /**
   * Get hotel rates/availability by ID
   * @param {string} hotelId - Hotel ID
   * @param {Object} params - Search params (checkin, checkout, guests)
   */
  async getHotelRates(hotelId, params) {
    try {
      // Format guests for API
      const guests = [];
      const roomCount = params.rooms || 1;
      const adultsCount = params.adults || 2;
      const adultsPerRoom = Math.ceil(adultsCount / roomCount);

      for (let i = 0; i < roomCount; i++) {
        guests.push({
          adults: adultsPerRoom,
          children: []
        });
      }

      const requestBody = {
        id: hotelId,
        checkin: params.checkIn,
        checkout: params.checkOut,
        guests: guests,
        currency: params.currency || 'USD',
        residency: 'us',
        language: 'en'
      };

      console.log('[RateHawk Service] Fetching rates for hotel:', hotelId, requestBody);

      const response = await this.withRetry(() =>
        api.post('/hotels/rates', requestBody)
      );

      console.log('[RateHawk Service] Rates response:', response.data);

      if (!response.data?.success) {
        throw new Error(response.data?.error || 'No rates available');
      }

      return response.data.rates || [];
    } catch (error) {
      console.error('[RateHawk Service] Get hotel rates error:', error);
      throw error;
    }
  }

  /**
   * Get hotel details by ID
   * @param {string} hotelId - Hotel ID
   */
  async getHotelDetails(hotelId) {
    try {
      // Use new clean endpoint
      const response = await this.withRetry(() =>
        api.post('/hotels/info', {
          id: hotelId,
          language: 'en'
        })
      );

      console.log('[RateHawk Service] Hotel info response:', response.data);

      if (!response.data?.success || !response.data?.hotel) {
        throw new Error('Hotel not found');
      }

      return this.transformHotelDetails(response.data.hotel);
    } catch (error) {
      console.error('[RateHawk Service] Get hotel details error:', error);
      throw error;
    }
  }

  /**
   * Get hotel reviews by ID
   * @param {string} hotelId - Hotel ID
   * @param {number} hid - Hotel numeric ID (optional)
   */
  async getHotelReviews(hotelId, hid = null) {
    try {
      const response = await api.post('/hotels/reviews', {
        id: hotelId,
        hid: hid,
        language: 'en'
      });

      console.log('[RateHawk Service] Reviews response:', response.data);

      if (response.data?.success) {
        return {
          reviews: response.data.reviews || [],
          total: response.data.total || 0,
          source: response.data.source || 'none'
        };
      }

      return { reviews: [], total: 0, source: 'none' };
    } catch (error) {
      console.error('[RateHawk Service] Get reviews error:', error);
      return { reviews: [], total: 0, source: 'error' };
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      await this.searchRegions('test');
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Create booking form - first step in booking process
   * Must be called before starting the actual booking
   *
   * @param {string} bookHash - The book_hash or match_hash from rate selection
   * @param {string} language - Language code (default: 'en')
   * @returns {Object} { order_id, partner_order_id, item_id, payment_types, ... }
   */
  async createBookingForm(bookHash, language = 'en') {
    try {
      console.log('[RateHawk Service] Creating booking form with hash:', bookHash);

      const response = await api.post('/hotels/booking/form', {
        book_hash: bookHash,
        match_hash: bookHash, // Send both for compatibility
        language
      });

      console.log('[RateHawk Service] Booking form response:', response.data);

      if (response.data?.success) {
        return {
          success: true,
          ...response.data.data
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Failed to create booking form'
      };
    } catch (error) {
      console.error('[RateHawk Service] Create booking form error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Finish/Complete the booking process with guest details
   * This calls the RateHawk /hotel/order/booking/finish/ API
   *
   * @param {Object} bookingData - Booking details
   * @param {string} bookingData.partner_order_id - From createBookingForm response
   * @param {Array} bookingData.guests - Array of guests [{first_name, last_name, is_child?, age?}]
   * @param {Object} bookingData.user - User contact {email, phone, comment?}
   * @param {Object} bookingData.payment - Payment info {type: 'deposit', amount, currency}
   * @param {number} bookingData.rooms_count - Number of rooms
   * @param {string} bookingData.stripe_payment_id - Stripe payment ID for records
   * @returns {Object} Booking result
   */
  async finishBooking(bookingData) {
    try {
      console.log('[RateHawk Service] Finishing booking:', bookingData.partner_order_id);

      const response = await api.post('/hotels/booking/finish', bookingData);

      console.log('[RateHawk Service] Finish booking response:', response.data);

      if (response.data?.success) {
        return {
          success: true,
          ...response.data.data,
          message: response.data.message
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Failed to complete booking'
      };
    } catch (error) {
      console.error('[RateHawk Service] Finish booking error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        details: error.response?.data?.details
      };
    }
  }

  /**
   * Check booking status
   * Polls RateHawk to get current booking status
   *
   * RateHawk status values:
   * - ok: booking finished successfully
   * - processing: booking still in progress
   * - 3ds: needs 3D Secure check (only for "now" payment type)
   * - error: booking failed
   *
   * @param {string} partnerOrderId - The partner order ID
   * @returns {Object} Booking status { success, status, error?, ... }
   */
  async checkBookingStatus(partnerOrderId) {
    try {
      console.log('[RateHawk Service] Checking booking status:', partnerOrderId);

      const response = await api.post('/hotels/booking/status', {
        partner_order_id: partnerOrderId
      });

      console.log('[RateHawk Service] Booking status response:', response.data);

      // Return the status from data object
      const data = response.data?.data || {};
      const status = data.status || 'unknown';

      return {
        success: response.data?.success !== false,
        status: status,
        partner_order_id: data.partner_order_id || partnerOrderId,
        percent: data.percent,
        data_3ds: data.data_3ds,
        error: response.data?.error,
        ...data
      };
    } catch (error) {
      console.error('[RateHawk Service] Check booking status error:', error);
      return {
        success: false,
        status: 'error',
        error: error.response?.data?.error || error.message
      };
    }
  }

  /**
   * Cancel a booking
   *
   * @param {string} partnerOrderId - The partner order ID
   * @returns {Object} Cancellation result
   */
  async cancelBooking(partnerOrderId) {
    try {
      console.log('[RateHawk Service] Cancelling booking:', partnerOrderId);

      const response = await api.post('/hotels/booking/cancel', {
        partner_order_id: partnerOrderId
      });

      console.log('[RateHawk Service] Cancel booking response:', response.data);

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message,
          ...response.data.data
        };
      }

      return {
        success: false,
        error: response.data?.error || 'Failed to cancel booking'
      };
    } catch (error) {
      console.error('[RateHawk Service] Cancel booking error:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }
}

// Create singleton instance
const ratehawkService = new RateHawkService();

export default ratehawkService;
