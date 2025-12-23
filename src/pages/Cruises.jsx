import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Anchor, MapPin, Calendar, Users, Star, Heart, Share2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import EnhancedSearch from '../components/EnhancedSearch';
import ToastContainer, { showToast } from '../components/ToastContainer';
import { useLocation } from '../context/LocationContext';
import './Cruises.css';

// Demo cruise data for display
const DEMO_CRUISES = [
  {
    id: 1,
    name: 'Caribbean Paradise Cruise',
    cruiseLine: 'Royal Caribbean',
    destination: 'Caribbean',
    duration: '7 Nights',
    ports: 5,
    rating: 4.8,
    reviews: 2456,
    price: 1299,
    image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=600',
    features: ['All-Inclusive', 'Pool', 'Spa', 'Entertainment']
  },
  {
    id: 2,
    name: 'Mediterranean Explorer',
    cruiseLine: 'MSC Cruises',
    destination: 'Mediterranean',
    duration: '10 Nights',
    ports: 7,
    rating: 4.7,
    reviews: 1823,
    price: 1899,
    image: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?w=600',
    features: ['Fine Dining', 'Excursions', 'Casino', 'Shows']
  },
  {
    id: 3,
    name: 'Alaskan Adventure',
    cruiseLine: 'Princess Cruises',
    destination: 'Alaska',
    duration: '7 Nights',
    ports: 4,
    rating: 4.9,
    reviews: 3102,
    price: 1599,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
    features: ['Glacier Views', 'Wildlife Tours', 'Luxury Cabins', 'Fine Dining']
  },
  {
    id: 4,
    name: 'Norwegian Fjords Journey',
    cruiseLine: 'Viking Ocean',
    destination: 'Norway',
    duration: '12 Nights',
    ports: 8,
    rating: 4.9,
    reviews: 1567,
    price: 2499,
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600',
    features: ['Scenic Routes', 'Cultural Tours', 'Nordic Spa', 'Gourmet Cuisine']
  },
  {
    id: 5,
    name: 'Greek Islands Discovery',
    cruiseLine: 'Celebrity Cruises',
    destination: 'Greece',
    duration: '8 Nights',
    ports: 6,
    rating: 4.8,
    reviews: 2089,
    price: 1799,
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600',
    features: ['Island Hopping', 'Beach Access', 'Rooftop Bar', 'Spa']
  },
  {
    id: 6,
    name: 'South Pacific Paradise',
    cruiseLine: 'Holland America',
    destination: 'South Pacific',
    duration: '14 Nights',
    ports: 9,
    rating: 4.7,
    reviews: 987,
    price: 2899,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600',
    features: ['Tropical Islands', 'Snorkeling', 'Live Music', 'Premium Dining']
  }
];

const Cruises = () => {
  const [searchParams] = useSearchParams();
  const [cruises, setCruises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // Get user location from context
  const { userLocation } = useLocation();

  // Extract search parameters
  const urlDestination = searchParams.get('destination') || '';
  const departureDate = searchParams.get('departure');
  const duration = searchParams.get('duration') || '7';
  const adults = searchParams.get('adults') || 2;
  const children = searchParams.get('children') || 0;

  // Use URL params or user's location for nearby cruises
  const destination = urlDestination || (userLocation?.city ? `${userLocation.city} Region` : '');

  // Check if search params exist
  const hasSearchParams = !!destination;
  const hasUrlSearchParams = !!urlDestination;

  // Filter demo cruises based on search params
  useEffect(() => {
    setLoading(true);

    // Simulate loading delay
    const timer = setTimeout(() => {
      let filteredCruises = [...DEMO_CRUISES];

      // Filter by destination if search params exist
      if (hasSearchParams && destination) {
        const searchTerm = destination.toLowerCase();
        filteredCruises = DEMO_CRUISES.filter(cruise =>
          cruise.destination.toLowerCase().includes(searchTerm) ||
          cruise.name.toLowerCase().includes(searchTerm)
        );

        // If no exact matches, show all cruises
        if (filteredCruises.length === 0) {
          filteredCruises = DEMO_CRUISES;
          showToast(`Showing all available cruises for "${destination}"`, 'info');
        } else {
          showToast(`Found ${filteredCruises.length} cruises for ${destination}!`, 'success');
        }
      } else {
        // Show all cruises when no search params
        filteredCruises = DEMO_CRUISES;
      }

      setCruises(filteredCruises);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [destination, duration, departureDate, adults, children, hasSearchParams]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleFavorite = (cruiseId) => {
    setFavorites((prev) =>
      prev.includes(cruiseId)
        ? prev.filter((id) => id !== cruiseId)
        : [...prev, cruiseId]
    );
  };

  const handleShare = (cruise) => {
    if (navigator.share) {
      navigator
        .share({
          title: cruise.name,
          text: `Check out this cruise: ${cruise.name}`,
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing:', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  return (
    <>
      <SEO
        title={`Cruises to ${destination} | Zanafly - Best Cruise Deals`}
        description={`Find and book amazing cruises to ${destination}. Compare prices and get the best cruise deals.`}
        keywords="cruise booking, cruise deals, vacation cruises, ocean cruises"
        canonical="/cruises"
      />

      <ToastContainer />

      <div className="cruises-page">
        <Header />

        {/* Search Section */}
        <div className="cruises-search-section">
          <EnhancedSearch initialTab="cruise" showTabs={false} />
        </div>

        {/* Results Section */}
        <div className="cruises-results-container">
          <div className="container">
            {/* Results Header */}
            <div className="cruises-results-header">
              <div>
                <p className="cruises-breadcrumb">
                  Home › Cruises{hasSearchParams ? ` › ${destination}` : ''}
                </p>
                <h1 className="cruises-title">
                  {!hasSearchParams ? 'Search for Cruises' :
                   loading ? 'Searching cruises...' : `${cruises.length} Cruises Found`}
                </h1>
                {hasSearchParams ? (
                  <p className="cruises-search-info">
                    {destination} • {duration} {duration === '1' ? 'Day' : 'Days'}
                    {departureDate && ` • Departs ${formatDate(departureDate)}`}
                    {' '}• {adults} {adults === '1' ? 'Passenger' : 'Passengers'}
                    {children !== '0' && ` + ${children} ${children === '1' ? 'Child' : 'Children'}`}
                  </p>
                ) : (
                  <p className="cruises-search-info">
                    Use the search above to find cruises
                  </p>
                )}
              </div>

              {/* Sort */}
              <div className="cruises-sort">
                <label htmlFor="sort">Sort by:</label>
                <select id="sort" className="cruises-sort-select">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Duration</option>
                  <option>Rating: High to Low</option>
                </select>
              </div>
            </div>

            {/* Cruises Grid */}
            <div className="cruises-grid">
              {loading ? (
                // Skeleton loaders
                [...Array(6)].map((_, i) => (
                  <div key={i} className="cruise-card skeleton">
                    <div className="cruise-card-image skeleton-image"></div>
                    <div className="cruise-card-content">
                      <div className="skeleton-text"></div>
                      <div className="skeleton-text short"></div>
                      <div className="skeleton-text"></div>
                    </div>
                  </div>
                ))
              ) : (
                // Cruise cards
                cruises.map((cruise) => (
                  <div key={cruise.id} className="cruise-card">
                    <div className="cruise-card-image-wrapper">
                      <img
                        src={cruise.image}
                        alt={cruise.name}
                        className="cruise-card-image"
                      />
                      <div className="cruise-card-badge">
                        <Anchor size={14} />
                        {cruise.cruiseLine}
                      </div>
                      <div className="cruise-card-rating">
                        <Star size={14} fill="currentColor" />
                        <span>{cruise.rating}</span>
                      </div>
                      <div className="card-action-buttons">
                        <button
                          className={`card-action-button favorite-button ${favorites.includes(cruise.id) ? 'active' : ''
                            }`}
                          onClick={() => toggleFavorite(cruise.id)}
                          aria-label="Add to favorites"
                        >
                          <Heart
                            size={20}
                            fill={favorites.includes(cruise.id) ? 'currentColor' : 'none'}
                          />
                        </button>
                        <button
                          className="card-action-button share-button"
                          onClick={() => handleShare(cruise)}
                          aria-label="Share"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="cruise-card-content">
                      <h3 className="cruise-card-name">{cruise.name}</h3>
                      <p className="cruise-card-location">
                        <MapPin size={14} />
                        {cruise.destination}
                      </p>

                      <div className="cruise-card-details">
                        <div className="cruise-detail">
                          <Calendar size={14} />
                          <span>{cruise.duration}</span>
                        </div>
                        <div className="cruise-detail">
                          <MapPin size={14} />
                          <span>{cruise.ports} Ports</span>
                        </div>
                        <div className="cruise-detail">
                          <Users size={14} />
                          <span>{cruise.reviews} reviews</span>
                        </div>
                      </div>

                      <div className="cruise-card-features">
                        {cruise.features.map((feature, index) => (
                          <span key={index} className="cruise-feature">
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="cruise-card-footer">
                        <div className="cruise-card-price-wrapper">
                          <span className="price-label">From</span>
                          <span className="price-amount">${cruise.price}</span>
                          <span className="price-period">per person</span>
                        </div>
                        <Link
                          to={`/cruise/${cruise.id}?name=${encodeURIComponent(cruise.name)}&cruiseLine=${encodeURIComponent(cruise.cruiseLine)}&destination=${encodeURIComponent(cruise.destination)}&duration=${encodeURIComponent(cruise.duration)}&ports=${cruise.ports}&rating=${cruise.rating}&reviews=${cruise.reviews}&price=${cruise.price}&image=${encodeURIComponent(cruise.image)}`}
                          className="cruise-card-button"
                        >View Details</Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* No Results */}
            {!loading && cruises.length === 0 && hasSearchParams && (
              <div className="no-results">
                <h3>No cruises found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            )}

            {/* No Search Yet */}
            {!loading && !hasSearchParams && (
              <div className="no-results">
                <h3>Enter your destination</h3>
                <p>Use the search form above to find available cruises</p>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Cruises;
