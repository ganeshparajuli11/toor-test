import React, { memo } from 'react';
import { ChevronLeft, ChevronRight, Star, Check, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EnhancedSearch from '../components/EnhancedSearch';
import SEO from '../components/SEO';
import useTravelData from '../hooks/useTravelData';
import './index.css';

/**
 * Loading Skeleton Component
 * Displays animated placeholder while data is loading
 */
const LoadingSkeleton = memo(({ type = 'card' }) => (
  <div className="skeleton">
    {type === 'card' && (
      <div className="skeleton-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
          <div className="skeleton-line title"></div>
          <div className="skeleton-line subtitle"></div>
          <div className="skeleton-line action"></div>
        </div>
      </div>
    )}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

/**
 * Error Message Component
 * Displays error message with retry option
 */
const ErrorMessage = memo(({ message, onRetry }) => (
  <div className="error-message">
    <p className="error-text">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="error-retry-btn">
        Try Again
      </button>
    )}
  </div>
));

ErrorMessage.displayName = 'ErrorMessage';

/**
 * Main Travel Booking Page Component
 * Displays hotels, flights, cruises, cars, and team information
 * Integrates with API for dynamic data fetching
 */
const TravelBookingPage = () => {
  // Fetch data from API with custom hooks
  const { data: hotels, loading: hotelsLoading, error: hotelsError, refetch: refetchHotels } = useTravelData('hotels');
  const { data: flights, loading: flightsLoading, error: flightsError, refetch: refetchFlights } = useTravelData('flights');
  const { data: cruises, loading: cruisesLoading, error: cruisesError, refetch: refetchCruises } = useTravelData('cruises');
  const { data: cars, loading: carsLoading, error: carsError, refetch: refetchCars } = useTravelData('cars');
  const { data: articles, loading: articlesLoading, error: articlesError, refetch: refetchArticles } = useTravelData('articles');
  const { data: team, loading: teamLoading, error: teamError, refetch: refetchTeam } = useTravelData('team');

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO
        title="TOUR - Best Travel Booking Platform | Hotels, Flights, Cruises & More"
        description="Book hotels, flights, cruises, and car rentals at the best prices. Explore the world with TOUR - your trusted travel companion. Get up to 25% off on first booking!"
        keywords="travel booking, hotels, flights, cruises, car rental, vacation packages, best travel deals"
        canonical="/"
      />

      <div className="homepage">
        {/* Header Component */}
        <Header />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div
          className="hero-background"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200)' }}
        ></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Upto 25% off on first booking<br />through your app!
          </h1>
          <p className="hero-subtitle">Download app now and explore the world</p>
          <div>
            <button className="hero-cta" onClick={() => toast.success('App download coming soon!')}>
              Download App
            </button>
          </div>
        </div>
      </section>

        {/* Enhanced Search Bar */}
        <EnhancedSearch />

        {/* Recommended Hotels */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Recommended Hotels</h2>
            <div className="section-nav">
              <button className="section-nav-btn prev" aria-label="Previous hotels">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next" aria-label="Next hotels">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {hotelsLoading ? (
            <div className="cards-grid">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : hotelsError ? (
            <ErrorMessage message={hotelsError} onRetry={refetchHotels} />
          ) : (
            <div className="cards-grid">
              {hotels?.map((hotel) => (
                <article key={hotel.id} className="card">
                  <div className="card-image-wrapper">
                    <img
                      src={hotel.img}
                      alt={hotel.name}
                      className="card-image"
                      loading="lazy"
                    />
                    {hotel.rating && (
                      <div className="card-badge">
                        <Star className="star-icon" size={14} />
                        <span className="card-badge-text">{hotel.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{hotel.name}</h3>
                    <p className="card-location">
                      <MapPin size={14} className="location-icon" />
                      {hotel.location}
                    </p>
                    <div className="card-footer">
                      <div>
                        <span className="card-price">${hotel.price}</span>
                        <span className="card-price-unit">/night</span>
                      </div>
                      <button
                        className="card-action-btn"
                        onClick={() => toast.success(`Booking ${hotel.name}...`)}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      {/* About Us Section */}
      <section id="about" className="about-section">
        <div className="about-grid">
          <div className="about-images">
            <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400" alt="Travel" className="about-image" />
            <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400" alt="Adventure" className="about-image" />
          </div>
          <div className="about-content">
            <h2 className="about-title">About Us</h2>
            <p className="about-description">We are dedicated to providing exceptional travel experiences that create lasting memories. Our team of experts ensures every journey is perfectly tailored to your needs.</p>
            <ul className="about-features">
              <li className="about-feature">
                <Check size={20} />
                <span>Best Price Guarantee</span>
              </li>
              <li className="about-feature">
                <Check size={20} />
                <span>24/7 Customer Support</span>
              </li>
              <li className="about-feature">
                <Check size={20} />
                <span>Handpicked Hotels</span>
              </li>
            </ul>
            <button className="about-cta" onClick={() => toast.info('About page coming soon!')}>
              Read More
            </button>
          </div>
        </div>
      </section>

      {/* Our Work */}
      <section id="services" className="section">
        <div className="section-header">
          <h2 className="section-title">Our Work</h2>
          <div className="section-nav">
            <button className="section-nav-btn prev">
              <ChevronLeft size={20} />
            </button>
            <button className="section-nav-btn next">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="work-grid">
          {['Book Flight', 'Book Cruises', 'Book Hotels', 'Book Tours'].map((item, idx) => (
            <div key={idx} className="work-card" onClick={() => toast.info(`${item} feature coming soon!`)}>
              <img
                src={`https://images.unsplash.com/photo-${['1436491865332-7a61a109cc05', '1578662996442-48f60103fc96', '1566073771259-6a8506099945', '1506905925346-21bda4d32df4'][idx]}?w=400`}
                alt={item}
                className="work-card-image"
              />
              <div className="work-card-overlay">
                <h3 className="work-card-title">{item}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

        {/* Recommended Flights */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Recommended Flights</h2>
            <div className="section-nav">
              <button className="section-nav-btn prev" aria-label="Previous flights">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next" aria-label="Next flights">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {flightsLoading ? (
            <div className="cards-grid">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : flightsError ? (
            <ErrorMessage message={flightsError} onRetry={refetchFlights} />
          ) : (
            <div className="cards-grid">
              {flights?.map((flight) => (
                <article key={flight.id} className="card">
                  <div className="card-image-wrapper">
                    <img
                      src={flight.img}
                      alt={flight.destination}
                      className="card-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{flight.destination}</h3>
                    <p className="card-location">{flight.airline}</p>
                    <div className="card-footer">
                      <div>
                        <span className="card-price">${flight.price}</span>
                        <span className="card-price-unit">/person</span>
                      </div>
                      <button
                        className="card-action-btn"
                        onClick={() => toast.success('Booking...')}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Recommended Cruise */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Recommended Cruise</h2>
            <div className="section-nav">
              <button className="section-nav-btn prev" aria-label="Previous cruises">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next" aria-label="Next cruises">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {cruisesLoading ? (
            <div className="cards-grid">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : cruisesError ? (
            <ErrorMessage message={cruisesError} onRetry={refetchCruises} />
          ) : (
            <div className="cards-grid">
              {cruises?.map((cruise) => (
                <article key={cruise.id} className="card">
                  <div className="card-image-wrapper">
                    <img
                      src={cruise.img}
                      alt={cruise.name}
                      className="card-image"
                      loading="lazy"
                    />
                    {cruise.rating && (
                      <div className="card-badge">
                        <Star className="star-icon" size={14} />
                        <span className="card-badge-text">{cruise.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{cruise.name}</h3>
                    <p className="card-location">{cruise.duration}</p>
                    <div className="card-footer">
                      <div>
                        <span className="card-price">${cruise.price}</span>
                        <span className="card-price-unit">/person</span>
                      </div>
                      <button
                        className="card-action-btn"
                        onClick={() => toast.success('Booking...')}
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Recommended Cars */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Recommended Cars</h2>
            <div className="section-nav">
              <button className="section-nav-btn prev" aria-label="Previous cars">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next" aria-label="Next cars">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {carsLoading ? (
            <div className="cards-grid">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : carsError ? (
            <ErrorMessage message={carsError} onRetry={refetchCars} />
          ) : (
            <div className="cards-grid">
              {cars?.map((car) => (
                <article key={car.id} className="card">
                  <div className="card-image-wrapper">
                    <img
                      src={car.img}
                      alt={car.model}
                      className="card-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{car.model}</h3>
                    <p className="card-location">{car.type}</p>
                    <div className="card-footer">
                      <div>
                        <span className="card-price">${car.price}</span>
                        <span className="card-price-unit">/day</span>
                      </div>
                      <button
                        className="card-action-btn"
                        onClick={() => toast.success('Booking...')}
                      >
                        Rent
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Blog Section */}
        <section id="blog" className="section blog-section">
          <div className="section-header">
            <h2 className="section-title">Our Blog and Articles</h2>
            <div className="section-nav">
              <button className="section-nav-btn prev" aria-label="Previous articles">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next" aria-label="Next articles">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {articlesLoading ? (
            <div className="blog-grid">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} type="card" />
              ))}
            </div>
          ) : articlesError ? (
            <ErrorMessage message={articlesError} onRetry={refetchArticles} />
          ) : (
            <div className="blog-grid">
              {articles?.map((article) => (
                <article key={article.id} className="blog-card">
                  <div className="blog-card-image-wrapper">
                    <img
                      src={article.img}
                      alt={article.title}
                      className="blog-card-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="blog-card-content">
                    <div>
                      <span className="blog-card-category">{article.category}</span>
                      <h3 className="blog-card-title">{article.title}</h3>
                      <p className="blog-card-date">{article.date}</p>
                    </div>
                    <button
                      className="blog-card-link"
                      onClick={() => toast.info('Coming soon!')}
                    >
                      Read More →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      {/* Why Choose Tour */}
      <section className="why-choose-section">
        <div className="why-choose-grid">
          <div>
            <h2 className="why-choose-title">Why Choose Tour</h2>
            <div className="why-choose-list">
              <div className="why-choose-item">
                <h3 className="why-choose-item-title">Personalized Service</h3>
                <p className="why-choose-item-description">Tailored experiences for every traveler</p>
              </div>
              <div className="why-choose-item">
                <h3 className="why-choose-item-title">24/7 Support</h3>
                <p className="why-choose-item-description">We're here whenever you need us</p>
              </div>
              <div className="why-choose-item">
                <h3 className="why-choose-item-title">Best Price</h3>
                <p className="why-choose-item-description">Competitive rates guaranteed</p>
              </div>
              <div className="why-choose-item">
                <h3 className="why-choose-item-title">Trusted Company</h3>
                <p className="why-choose-item-description">Years of excellence in travel</p>
              </div>
            </div>
          </div>
          <div className="why-choose-image">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
              alt="Mountains"
            />
          </div>
        </div>
      </section>

        {/* Team Section */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Meet Our Team</h2>
            <div className="section-nav">
              <button className="section-nav-btn prev" aria-label="Previous team members">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next" aria-label="Next team members">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {teamLoading ? (
            <div className="cards-grid">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : teamError ? (
            <ErrorMessage message={teamError} onRetry={refetchTeam} />
          ) : (
            <div className="cards-grid">
              {team?.map((member) => (
                <article key={member.id} className="team-card">
                  <div className="team-card-image-wrapper">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="team-card-image"
                      loading="lazy"
                    />
                  </div>
                  <div className="team-card-content">
                    <h3 className="team-card-name">{member.name}</h3>
                    <p className="team-card-role">{member.role}</p>
                    <div className="team-card-social">
                      <button
                        className="team-social-btn"
                        aria-label={`${member.name} Facebook`}
                        onClick={() => toast.info('Coming soon!')}
                      >
                        <span>f</span>
                      </button>
                      <button
                        className="team-social-btn"
                        aria-label={`${member.name} Twitter`}
                        onClick={() => toast.info('Coming soon!')}
                      >
                        <span>t</span>
                      </button>
                      <button
                        className="team-social-btn"
                        aria-label={`${member.name} LinkedIn`}
                        onClick={() => toast.info('Coming soon!')}
                      >
                        <span>in</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div
          className="testimonials-background"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200)' }}
        ></div>
        <div className="testimonials-content">
          <h2 className="testimonials-title">What Travellers Say About Us</h2>
          <div className="testimonials-avatars">
            <img
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
              alt="Testimonial"
              className="testimonial-avatar"
            />
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
              alt="Testimonial"
              className="testimonial-avatar"
            />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
              alt="Testimonial"
              className="testimonial-avatar"
            />
          </div>
          <div className="testimonial-box">
            <div className="testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="text-yellow-400 fill-yellow-400" size={24} />
              ))}
            </div>
            <p className="testimonial-text">
              "Amazing experience! The team was professional and the destinations were breathtaking. Highly recommend to anyone looking for adventure."
            </p>
            <p className="testimonial-author">- Sarah Johnson</p>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="partners-section">
        <h2 className="partners-title">Our Partners</h2>
        <div className="partners-grid">
          {['Expedia', 'TripAdvisor', 'Booking', 'Airbnb', 'Kayak', 'Hotels', 'Agoda'].map((partner, idx) => (
            <div key={idx} className="partner-logo">
              {partner}
            </div>
          ))}
        </div>
      </section>

        {/* Footer Component */}
        <Footer />
      </div>
    </>
  );
};

export default TravelBookingPage;