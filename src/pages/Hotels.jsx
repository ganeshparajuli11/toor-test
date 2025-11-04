import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Star, Wifi, Coffee, Tv, Wind } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import EnhancedSearch from '../components/EnhancedSearch';
import './Hotels.css';

const Hotels = () => {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract search parameters
  const location = searchParams.get('location') || 'Various Locations';
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = searchParams.get('adults') || 2;
  const children = searchParams.get('children') || 0;
  const rooms = searchParams.get('rooms') || 1;

  // Demo hotel data
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setHotels([
        {
          id: 1,
          name: 'Grand Plaza Hotel',
          location: location,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
          rating: 4.8,
          reviews: 245,
          price: 120,
          amenities: ['Free WiFi', 'Breakfast', 'Pool', 'AC'],
          description: 'Luxury hotel with stunning views and excellent service'
        },
        {
          id: 2,
          name: 'Ocean View Resort',
          location: location,
          image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
          rating: 4.6,
          reviews: 189,
          price: 95,
          amenities: ['Free WiFi', 'Beach Access', 'Restaurant', 'AC'],
          description: 'Beautiful beachfront property perfect for relaxation'
        },
        {
          id: 3,
          name: 'City Center Inn',
          location: location,
          image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=300&fit=crop',
          rating: 4.5,
          reviews: 312,
          price: 80,
          amenities: ['Free WiFi', 'Parking', 'Breakfast', 'Gym'],
          description: 'Conveniently located in the heart of the city'
        },
        {
          id: 4,
          name: 'Mountain Lodge',
          location: location,
          image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
          rating: 4.9,
          reviews: 156,
          price: 150,
          amenities: ['Free WiFi', 'Spa', 'Restaurant', 'Hiking'],
          description: 'Peaceful mountain retreat with breathtaking scenery'
        },
        {
          id: 5,
          name: 'Downtown Boutique Hotel',
          location: location,
          image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop',
          rating: 4.7,
          reviews: 203,
          price: 110,
          amenities: ['Free WiFi', 'Bar', 'Rooftop', 'AC'],
          description: 'Stylish boutique hotel with modern amenities'
        },
        {
          id: 6,
          name: 'Garden Suites',
          location: location,
          image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
          rating: 4.4,
          reviews: 178,
          price: 75,
          amenities: ['Free WiFi', 'Garden', 'Parking', 'Breakfast'],
          description: 'Tranquil garden setting with comfortable accommodations'
        }
      ]);
      setLoading(false);
    }, 800);
  }, [location]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <SEO
        title={`Hotels in ${location} | TOOR - Find Your Perfect Stay`}
        description={`Find and book the best hotels in ${location}. Compare prices, read reviews, and get the best deals.`}
        keywords="hotel booking, hotels, accommodation, best hotel deals"
        canonical="/hotels"
      />

      <div className="hotels-page">
        <Header />

        {/* Search Section */}
        <div className="hotels-search-section">
          <EnhancedSearch initialTab="hotel" showTabs={false} />
        </div>

        {/* Results Section */}
        <div className="hotels-results-container">
          <div className="container">
            {/* Results Header */}
            <div className="hotels-results-header">
              <div>
                <p className="hotels-breadcrumb">
                  Home › Hotels in {location}
                </p>
                <h1 className="hotels-title">
                  {loading ? 'Loading...' : `${hotels.length} Hotels Found`}
                  {checkIn && checkOut && (
                    <span className="hotels-dates">
                      {' '}for {formatDate(checkIn)} - {formatDate(checkOut)}
                    </span>
                  )}
                </h1>
                <p className="hotels-search-info">
                  {rooms} {rooms === '1' ? 'Room' : 'Rooms'} • {adults} {adults === '1' ? 'Adult' : 'Adults'}
                  {children !== '0' && ` • ${children} ${children === '1' ? 'Child' : 'Children'}`}
                </p>
              </div>

              {/* Sort */}
              <div className="hotels-sort">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" className="hotels-sort-select">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating: High to Low</option>
                  <option>Distance</option>
                </select>
              </div>
            </div>

            {/* Hotels Grid */}
            <div className="hotels-grid">
              {loading ? (
                // Skeleton loaders
                [...Array(6)].map((_, i) => (
                  <div key={i} className="hotel-card skeleton">
                    <div className="hotel-card-image skeleton-image"></div>
                    <div className="hotel-card-content">
                      <div className="skeleton-text"></div>
                      <div className="skeleton-text short"></div>
                      <div className="skeleton-text"></div>
                    </div>
                  </div>
                ))
              ) : (
                // Hotel cards
                hotels.map((hotel) => (
                  <div key={hotel.id} className="hotel-card">
                    <div className="hotel-card-image-wrapper">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="hotel-card-image"
                        loading="lazy"
                      />
                      <div className="hotel-card-rating">
                        <Star size={14} fill="currentColor" />
                        <span>{hotel.rating}</span>
                      </div>
                    </div>
                    <div className="hotel-card-content">
                      <h3 className="hotel-card-name">{hotel.name}</h3>
                      <p className="hotel-card-location">
                        <MapPin size={14} />
                        {hotel.location}
                      </p>
                      <p className="hotel-card-description">{hotel.description}</p>

                      <div className="hotel-card-amenities">
                        {hotel.amenities.slice(0, 4).map((amenity, index) => (
                          <span key={index} className="hotel-amenity">
                            {amenity === 'Free WiFi' && <Wifi size={14} />}
                            {amenity === 'Breakfast' && <Coffee size={14} />}
                            {amenity === 'AC' && <Wind size={14} />}
                            {amenity === 'Pool' && <Tv size={14} />}
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <div className="hotel-card-footer">
                        <div className="hotel-card-reviews">
                          <span className="review-score">Excellent</span>
                          <span className="review-count">{hotel.reviews} reviews</span>
                        </div>
                        <div className="hotel-card-price-wrapper">
                          <div className="hotel-card-price">
                            <span className="price-label">From</span>
                            <span className="price-amount">${hotel.price}</span>
                            <span className="price-period">/night</span>
                          </div>
                          <Link to={`/property/${hotel.id}`} className="hotel-card-button">View Details</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* No Results */}
            {!loading && hotels.length === 0 && (
              <div className="no-results">
                <h3>No hotels found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Hotels;
