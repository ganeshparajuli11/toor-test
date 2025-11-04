import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Anchor, MapPin, Calendar, Users, Star } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import EnhancedSearch from '../components/EnhancedSearch';
import './Cruises.css';

const Cruises = () => {
  const [searchParams] = useSearchParams();
  const [cruises, setCruises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract search parameters
  const destination = searchParams.get('destination') || 'Various Destinations';
  const departureDate = searchParams.get('departureDate');
  const duration = searchParams.get('duration') || '7';
  const adults = searchParams.get('adults') || 2;
  const children = searchParams.get('children') || 0;

  // Demo cruise data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCruises([
        {
          id: 1,
          name: 'Caribbean Paradise Cruise',
          cruiseLine: 'Royal Ocean Lines',
          destination: destination,
          image: 'https://images.unsplash.com/photo-1545969734-706fc936d8db?w=400&h=300&fit=crop',
          duration: `${duration} Days`,
          ports: 5,
          rating: 4.8,
          reviews: 342,
          price: 899,
          features: ['All Meals', 'Entertainment', 'Pool', 'Spa']
        },
        {
          id: 2,
          name: 'Mediterranean Explorer',
          cruiseLine: 'Luxury Seas',
          destination: destination,
          image: 'https://images.unsplash.com/photo-1560264418-c4445382edbc?w=400&h=300&fit=crop',
          duration: `${duration} Days`,
          ports: 7,
          rating: 4.9,
          reviews: 456,
          price: 1299,
          features: ['All Meals', 'Shore Excursions', 'Casino', 'Fine Dining']
        },
        {
          id: 3,
          name: 'Alaska Wilderness Voyage',
          cruiseLine: 'Adventure Cruises',
          destination: destination,
          image: 'https://images.unsplash.com/photo-1554672408-730838453273?w=400&h=300&fit=crop',
          duration: `${duration} Days`,
          ports: 4,
          rating: 4.7,
          reviews: 289,
          price: 1099,
          features: ['All Meals', 'Glacier Viewing', 'Wildlife Tours', 'Spa']
        },
        {
          id: 4,
          name: 'South Pacific Dream',
          cruiseLine: 'Island Voyages',
          destination: destination,
          image: 'https://images.unsplash.com/photo-1563729147818-22cc0b7d15d9?w=400&h=300&fit=crop',
          duration: `${duration} Days`,
          ports: 6,
          rating: 4.6,
          reviews: 234,
          price: 1499,
          features: ['All Meals', 'Water Sports', 'Private Beach', 'Pool']
        },
        {
          id: 5,
          name: 'Baltic Sea Adventure',
          cruiseLine: 'Nordic Cruises',
          destination: destination,
          image: 'https://images.unsplash.com/photo-1548625149-720da0e44640?w=400&h=300&fit=crop',
          duration: `${duration} Days`,
          ports: 8,
          rating: 4.8,
          reviews: 312,
          price: 1199,
          features: ['All Meals', 'Cultural Tours', 'Entertainment', 'Spa']
        },
        {
          id: 6,
          name: 'Tropical Island Hopper',
          cruiseLine: 'Sunshine Cruises',
          destination: destination,
          image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop',
          duration: `${duration} Days`,
          ports: 5,
          rating: 4.5,
          reviews: 198,
          price: 799,
          features: ['All Meals', 'Beach Access', 'Pool', 'Entertainment']
        }
      ]);
      setLoading(false);
    }, 800);
  }, [destination, duration]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <SEO
        title={`Cruises to ${destination} | TOOR - Best Cruise Deals`}
        description={`Find and book amazing cruises to ${destination}. Compare prices and get the best cruise deals.`}
        keywords="cruise booking, cruise deals, vacation cruises, ocean cruises"
        canonical="/cruises"
      />

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
                  Home › Cruises › {destination}
                </p>
                <h1 className="cruises-title">
                  {loading ? 'Loading...' : `${cruises.length} Cruises Found`}
                </h1>
                <p className="cruises-search-info">
                  {destination} • {duration} {duration === '1' ? 'Day' : 'Days'}
                  {departureDate && ` • Departs ${formatDate(departureDate)}`}
                  {' '}• {adults} {adults === '1' ? 'Passenger' : 'Passengers'}
                  {children !== '0' && ` + ${children} ${children === '1' ? 'Child' : 'Children'}`}
                </p>
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
                        loading="lazy"
                      />
                      <div className="cruise-card-badge">
                        <Anchor size={14} />
                        {cruise.cruiseLine}
                      </div>
                      <div className="cruise-card-rating">
                        <Star size={14} fill="currentColor" />
                        <span>{cruise.rating}</span>
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
                        <Link to={`/cruise/${cruise.id}`} className="cruise-card-button">View Details</Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* No Results */}
            {!loading && cruises.length === 0 && (
              <div className="no-results">
                <h3>No cruises found</h3>
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

export default Cruises;
