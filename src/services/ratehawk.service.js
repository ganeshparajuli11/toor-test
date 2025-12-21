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
   * @private
   */
  async enrichHotelsWithDetails(hotels) {
    try {
      const topHotels = hotels.slice(0, 15);

      const detailsPromises = topHotels.map(async (hotel) => {
        try {
          // Use new clean endpoint
          const infoResponse = await api.post('/hotels/info', {
            id: hotel.id,
            language: 'en'
          });

          if (infoResponse.data?.success && infoResponse.data?.hotel) {
            const info = infoResponse.data.hotel;
            // Merge hotel info with search result, preserving best_offer from search
            return {
              id: hotel.id,
              hid: hotel.hid || info.hid,
              name: info.name || hotel.name,
              location: info.address ? `${info.address}, ${info.city || ''}` : hotel.name,
              address: info.address,
              city: info.city,
              country: info.country,
              rating: info.star_rating || 4,
              reviewScore: info.review_score || 8.5,
              reviews: info.reviews_count || 0,
              price: parseFloat(hotel.best_offer?.total_price) || 0,
              currency: hotel.best_offer?.currency || 'USD',
              description: info.description || `Experience luxury at ${info.name}`,
              image: info.images?.[0] || this.getRandomFallbackImage(),
              images: info.images || [this.getRandomFallbackImage()],
              amenities: info.amenities || ['Free WiFi', 'Air Conditioning'],
              best_offer: hotel.best_offer,
              total_rates: hotel.total_rates
            };
          }
          return this.transformBasicHotel(hotel);
        } catch (err) {
          console.warn(`Failed to fetch details for hotel ${hotel.id}:`, err.message);
          return this.transformBasicHotel(hotel);
        }
      });

      return await Promise.all(detailsPromises);
    } catch (error) {
      console.error('Enrich hotels error:', error);
      return hotels.map(h => this.transformBasicHotel(h));
    }
  }

  /**
   * Transform basic hotel data (when full details not available)
   * @private
   */
  transformBasicHotel(hotel) {
    return {
      id: hotel.id,
      hid: hotel.hid,
      name: hotel.name || hotel.id,
      location: 'Location',
      rating: 4,
      reviewScore: 8.0,
      reviews: 0,
      price: parseFloat(hotel.best_offer?.total_price) || 0,
      currency: hotel.best_offer?.currency || 'USD',
      description: `Experience ${hotel.name}`,
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
   * @private
   */
  transformHotelDetails(response) {
    const hotel = response.hotel || response;

    // Process all images
    const images = this.extractImages(hotel);

    // Handle description
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

    // Handle amenities
    let amenities = [];
    if (hotel.amenities && Array.isArray(hotel.amenities)) {
      amenities = hotel.amenities.map(a => typeof a === 'string' ? a : (a.name || a.title || ''));
    } else if (hotel.amenity_groups && Array.isArray(hotel.amenity_groups)) {
      hotel.amenity_groups.forEach(group => {
        if (group.amenities) {
          amenities.push(...group.amenities.map(a => typeof a === 'string' ? a : (a.name || a)));
        }
      });
    }

    // Build location string
    const locationParts = [];
    if (hotel.address) locationParts.push(hotel.address);
    if (hotel.city) locationParts.push(hotel.city);
    if (hotel.country) locationParts.push(hotel.country);
    const location = locationParts.join(', ') || 'Location not available';

    return {
      id: hotel.id,
      name: hotel.name || 'Hotel',
      location: location,
      address: hotel.address,
      rating: hotel.star_rating || (hotel.review_score ? hotel.review_score / 2 : 4.0),
      reviewCount: hotel.reviews_count || hotel.review_count || 0,
      price: hotel.min_price || 0,
      description: description,
      images: images,
      amenities: amenities.length > 0 ? amenities : ['Free WiFi', 'Air Conditioning'],
      tags: hotel.kind ? [hotel.kind] : [],
      overallRating: hotel.star_rating || (hotel.review_score ? hotel.review_score / 2 : 4.0),
      totalReviews: hotel.reviews_count || hotel.review_count || 0,
      ratingBreakdown: {
        'Staff/service': 4.5,
        'Location': 4.2,
        'Amenities': 4.3,
        'Hospitality': 4.4,
        'Cleanliness': 4.5,
      },
      mapEmbedUrl: hotel.latitude && hotel.longitude
        ? `https://maps.google.com/maps?q=${hotel.latitude},${hotel.longitude}&z=15&output=embed`
        : null,
      coordinates: {
        latitude: hotel.latitude,
        longitude: hotel.longitude
      },
      policies: hotel.policies || {},
      contact: {
        phone: hotel.phone,
        email: hotel.email
      },
      rateHawkData: hotel
    };
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
}

// Create singleton instance
const ratehawkService = new RateHawkService();

export default ratehawkService;
