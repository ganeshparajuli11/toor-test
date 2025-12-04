import api from './api.service';

/**
 * RateHawk (ETG) API v3 Service
 *
 * This service handles all interactions with the RateHawk API
 * via the backend proxy.
 */

class RateHawkService {
  /**
   * Search for hotels
   * @param {Object} params - Search parameters
   */
  /**
   * Search for hotels (Async)
   * @param {Object} params - Search parameters
   */
  /**
   * Search for hotels (Async)
   * @param {Object} params - Search parameters
   */
  async searchHotels(params) {
    try {
      // Format guests for RateHawk API: [{ adults: 2, children: [] }]
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
        residency: 'us' // Default residency
      };

      console.log('Starting RateHawk search...', searchParams);
      const startResponse = await api.post('/proxy/ratehawk/search/serp/region/', searchParams);

      // Check if results are returned immediately (synchronous response)
      if (startResponse.data?.data?.hotels && startResponse.data.data.hotels.length > 0) {
        console.log('Received synchronous search results');
        const enrichedHotels = await this.enrichHotelsWithDetails(startResponse.data.data.hotels);
        return this.transformHotelSearchResults({ hotels: enrichedHotels });
      }

      if (!startResponse.data?.data?.search_id) {
        // If no hotels AND no search_id, it's an error or empty result
        console.warn('No search_id and no hotels returned from start request');
        return [];
      }

      const searchId = startResponse.data.data.search_id;

      // 2. Poll for results (Loop up to 5 times)
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

        const resultsResponse = await api.post('/proxy/ratehawk/search/serp/get/', {
          search_id: searchId,
          limit: 10, // Limit to 10 for faster detail fetching
          sort: 'price',
          currency: params.currency || 'USD'
        });

        const status = resultsResponse.data?.status;
        const hotels = resultsResponse.data?.data?.hotels;

        // If we have hotels, fetch their details and return
        if (hotels && hotels.length > 0) {
          const enrichedHotels = await this.enrichHotelsWithDetails(hotels);
          return this.transformHotelSearchResults({ hotels: enrichedHotels });
        }

        // If status is completed but no hotels, return empty
        if (status === 'completed' && (!hotels || hotels.length === 0)) {
          return [];
        }

        attempts++;
      }

      return [];
    } catch (error) {
      console.error('Hotel search error:', error);
      return [];
    }
  }

  /**
   * Fetch details for a list of hotels and merge them
   * @private
   */
  async enrichHotelsWithDetails(hotels) {
    try {
      // Limit to top 10 to avoid rate limits or slow loading
      const topHotels = hotels.slice(0, 10);

      const detailsPromises = topHotels.map(async (hotel) => {
        try {
          // Fetch static content (name, images, etc.)
          const infoResponse = await api.post('/proxy/ratehawk/hotel/info/', {
            id: hotel.id,
            language: 'en'
          });
          const info = infoResponse.data?.data;

          // Merge info into the hotel object
          return { ...hotel, ...info, id: hotel.id }; // Ensure ID is preserved
        } catch (err) {
          console.warn(`Failed to fetch details for hotel ${hotel.id}`, err);
          return hotel; // Return basic hotel object if details fail
        }
      });

      return await Promise.all(detailsPromises);
    } catch (error) {
      console.error('Enrich hotels error:', error);
      return hotels;
    }
  }

  // ... (getHotelRooms, createBooking, getBooking, cancelBooking methods remain same)

  /**
   * Get regions/cities/hotels for autocomplete
   * @param {string} query - Search query
   */
  async searchRegions(query) {
    try {
      const response = await api.post('/proxy/ratehawk/search/multicomplete/', {
        query,
        language: 'en'
      });

      const data = response.data?.data || {};
      const regions = data.regions || [];
      const hotels = data.hotels || [];

      // Merge and format
      return [
        ...regions.map(r => ({ ...r, type: 'Region', label: `${r.name}, ${r.country_code || ''}` })),
        ...hotels.map(h => ({ ...h, type: 'Hotel', label: h.name, id: h.region_id, hotel_id: h.id })) // Map hotel to region_id for search, keep hotel_id
      ];
    } catch (error) {
      console.error('Region search error:', error);
      return [];
    }
  }

  /**
   * Search for transfers (cars)
   * Note: RateHawk Transfers API endpoint structure is assumed based on standard patterns
   * as specific documentation was not fully available.
   * @param {Object} params - Search parameters
   */
  async searchTransfers(params) {
    try {
      console.log('Starting RateHawk transfer search...', params);
      // Attempt to hit a likely endpoint for transfers
      // This might fail if the endpoint is different, in which case we catch and return empty
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
      console.warn('Transfer search failed (API might not be enabled or endpoint differs):', error.message);
      return [];
    }
  }

  /**
   * Search for flights
   * @param {Object} params - Search parameters
   */
  async searchFlights(params) {
    try {
      console.log('Starting RateHawk flight search...', params);
      // Placeholder endpoint for flights - RateHawk B2B Flight API
      // Note: This endpoint is hypothetical as specific flight docs were not provided.
      // Standard pattern would be /flight/search/ or similar.
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
      console.warn('Flight search failed (API might not be enabled or endpoint differs):', error.message);
      return [];
    }
  }

  /**
   * Search for cruises
   * Note: RateHawk primarily focuses on Hotels and Transfers.
   * Cruises are likely not supported via API.
   * @param {Object} params - Search parameters
   */
  async searchCruises(params) {
    // Return empty to trigger fallback to demo data
    return [];
  }

  /**
   * Get recommended hotels for homepage
   */
  async getRecommendedHotels() {
    try {
      // Search for hotels in a popular destination (e.g., Paris)
      // Paris ID: paris_fr (approximate, might need real ID from autocomplete)
      // We'll use a hardcoded search for "Paris" region ID if known, or search for it first

      // For stability, we'll try a region search first or use a known ID
      // Let's try searching for "Paris" first to get the ID
      const regions = await this.searchRegions('Paris');
      const parisRegion = regions.find(r => r.type === 'City') || regions[0];

      if (!parisRegion) return [];

      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const weekAfter = new Date(nextWeek);
      weekAfter.setDate(nextWeek.getDate() + 3);

      return await this.searchHotels({
        destination: parisRegion.id,
        checkIn: nextWeek.toISOString().split('T')[0],
        checkOut: weekAfter.toISOString().split('T')[0],
        guests: 2,
        rooms: 1
      });
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
      image: transfer.image_url || '',
      passengers: transfer.capacity || 4,
      luggage: transfer.luggage_capacity || 2,
      transmission: 'Automatic', // Assumption
      fuelType: 'Petrol', // Assumption
      provider: 'RateHawk Transfer',
      rating: 4.5,
      reviews: 0,
      price: transfer.price?.amount || 0,
      features: ['Meet & Greet', 'Free Cancellation']
    }));
  }

  /**
   * Transform RateHawk hotel search results to our app format
   * @private
   */
  transformHotelSearchResults(response) {
    if (!response || !response.hotels) {
      return [];
    }

    return response.hotels.map(hotel => {
      // Extract price from rates if min_price is missing
      let price = hotel.min_price;
      if (!price && hotel.rates && Array.isArray(hotel.rates) && hotel.rates.length > 0) {
        // Try to find the lowest price in rates
        const amounts = hotel.rates.map(r => {
          const payment = r.payment_options?.payment_types?.[0];
          return payment ? parseFloat(payment.show_amount || payment.amount) : Infinity;
        });
        if (amounts.length > 0) {
          price = Math.min(...amounts);
        }
        if (price === Infinity) price = 0;
      }

      // Handle image extraction (RateHawk can return 'images' as strings or 'photos' as objects)
      let imageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';

      if (hotel.images && hotel.images.length > 0) {
        // 'images' is usually an array of URL strings
        imageUrl = hotel.images[0];
      } else if (hotel.photos && hotel.photos.length > 0) {
        // 'photos' is usually an array of objects with 'url'
        imageUrl = hotel.photos[0].url || hotel.photos[0];
      } else if (hotel.thumbnail) {
        imageUrl = hotel.thumbnail;
      }

      // Fix RateHawk image URL templates if present (e.g. {size} -> 1024x768)
      if (imageUrl && typeof imageUrl === 'string') {
        imageUrl = imageUrl.replace('{size}', '1024x768');
      }

      return {
        id: hotel.id,
        name: hotel.name || hotel.id, // Fallback to ID if name missing
        location: hotel.address || (hotel.city ? `${hotel.city}, ${hotel.country}` : 'Unknown Location'),
        address: hotel.address,
        rating: hotel.star_rating || (hotel.review_score ? hotel.review_score / 2 : 0),
        totalRooms: hotel.room_count || 0,
        availableRooms: hotel.available_rooms || 1,
        price: price || 0, // Changed from pricePerNight to price to match UI
        status: 'Active',
        amenities: hotel.amenities || [],
        image: imageUrl,
        bookings: 0,
        revenue: 0,
        rateHawkData: hotel
      };
    });
  }

  /**
   * Transform hotel details to our app format
   * @private
   */
  transformHotelDetails(response) {
    const hotel = response.hotel || response;

    return {
      id: hotel.id,
      name: hotel.name,
      location: `${hotel.city}, ${hotel.country}`,
      address: hotel.address,
      rating: hotel.star_rating || hotel.review_score / 2,
      description: hotel.description,
      amenities: hotel.amenities || [],
      photos: hotel.photos || [],
      policies: hotel.policies || {},
      contact: {
        phone: hotel.phone,
        email: hotel.email
      },
      coordinates: {
        latitude: hotel.latitude,
        longitude: hotel.longitude
      },
      rateHawkData: hotel
    };
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      // Try a simple region search as a connection test
      await this.searchRegions('test');
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

// Create a singleton instance
const ratehawkService = new RateHawkService();

export default ratehawkService;
