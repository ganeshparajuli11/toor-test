import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Check, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EnhancedSearch from '../components/EnhancedSearch';
import ImageSlider from '../components/ImageSlider';
import SEO from '../components/SEO';
import useTravelData from '../hooks/useTravelData';
import { useLocation } from '../context/LocationContext';
import './index.css';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: 'easeOut' }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: 'easeOut' }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

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
 * Animated Section Header Component
 */
const SectionHeader = memo(({ title, children }) => (
  <motion.div
    className="section-header"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    variants={fadeInUp}
  >
    <h2 className="section-title">{title}</h2>
    {children}
  </motion.div>
));

SectionHeader.displayName = 'SectionHeader';

/**
 * Main Travel Booking Page Component
 * Displays hotels, flights, cruises, cars, and team information
 * Integrates with API for dynamic data fetching
 */
const TravelBookingPage = () => {
  // Get user location from context
  const { userLocation } = useLocation();

  // Fetch data from API with custom hooks - pass user location for personalized results
  const { data: hotels, loading: hotelsLoading, error: hotelsError, refetch: refetchHotels } = useTravelData('hotels', userLocation);
  const { data: flights, loading: flightsLoading, error: flightsError, refetch: refetchFlights } = useTravelData('flights', userLocation);
  const { data: cruises, loading: cruisesLoading, error: cruisesError, refetch: refetchCruises } = useTravelData('cruises', userLocation);
  const { data: cars, loading: carsLoading, error: carsError, refetch: refetchCars } = useTravelData('cars', userLocation);
  const { data: articles, loading: articlesLoading, error: articlesError, refetch: refetchArticles } = useTravelData('articles', userLocation);
  const { data: team, loading: teamLoading, error: teamError, refetch: refetchTeam } = useTravelData('team', userLocation);

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
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Upto 25% off on first booking<br />through your app!
            </motion.h1>
            <motion.p
              className="hero-subtitle"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Download app now and explore the world
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                className="hero-cta"
                onClick={() => toast.success('App download coming soon!')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Download App
              </motion.button>
            </motion.div>
          </motion.div>
        </section>

        {/* Enhanced Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <EnhancedSearch />
        </motion.div>

        {/* Recommended Hotels */}
        <section className="section">
          <SectionHeader title={userLocation?.city ? `Hotels in ${userLocation.city}` : 'Recommended Hotels'}>
            <div className="section-nav">
              <button className="section-nav-btn prev" aria-label="Previous hotels">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next" aria-label="Next hotels">
                <ChevronRight size={20} />
              </button>
            </div>
          </SectionHeader>

          {hotelsLoading ? (
            <div className="cards-grid">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : hotelsError ? (
            <ErrorMessage message={hotelsError} onRetry={refetchHotels} />
          ) : (
            <motion.div
              className="cards-grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {hotels?.map((hotel) => (
                <motion.article
                  key={hotel.id}
                  className="card"
                  variants={cardVariant}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <div className="card-image-wrapper">
                    <ImageSlider
                      images={hotel.images || [hotel.image || hotel.img]}
                      alt={hotel.name}
                      className="card-image-slider"
                    />
                    {hotel.rating && (
                      <div className="card-badge">
                        <Star className="star-icon" size={14} />
                        <span className="card-badge-text">{typeof hotel.rating === 'number' ? hotel.rating.toFixed(1) : hotel.rating}</span>
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
                      <Link
                        to={`/property/${hotel.id}`}
                        className="card-action-btn"
                        onClick={() => {
                          // Store hotel data in sessionStorage for quick access on details page
                          sessionStorage.setItem(`hotel_${hotel.id}`, JSON.stringify({
                            id: hotel.id,
                            name: hotel.name,
                            location: hotel.location,
                            rating: hotel.rating,
                            price: hotel.price,
                            images: hotel.images || [hotel.img],
                            amenities: hotel.amenities
                          }));
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </section>

        {/* About Us Section */}
        <section id="about" className="about-section">
          <div className="about-grid">
            <motion.div
              className="about-images"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideInLeft}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400"
                alt="Travel"
                className="about-image"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <motion.img
                src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400"
                alt="Adventure"
                className="about-image"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <motion.div
              className="about-content"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideInRight}
            >
              <h2 className="about-title">About Us</h2>
              <p className="about-description">We are dedicated to providing exceptional travel experiences that create lasting memories. Our team of experts ensures every journey is perfectly tailored to your needs.</p>
              <motion.ul
                className="about-features"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.li className="about-feature" variants={fadeInUp}>
                  <Check size={20} />
                  <span>Best Price Guarantee</span>
                </motion.li>
                <motion.li className="about-feature" variants={fadeInUp}>
                  <Check size={20} />
                  <span>24/7 Customer Support</span>
                </motion.li>
                <motion.li className="about-feature" variants={fadeInUp}>
                  <Check size={20} />
                  <span>Handpicked Hotels</span>
                </motion.li>
              </motion.ul>
              <motion.button
                className="about-cta"
                onClick={() => toast.info('About page coming soon!')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Read More
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Our Work */}
        <section id="services" className="section">
          <SectionHeader title="Our Work">
            <div className="section-nav">
              <button className="section-nav-btn prev">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next">
                <ChevronRight size={20} />
              </button>
            </div>
          </SectionHeader>
          <motion.div
            className="work-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {['Book Flight', 'Book Cruises', 'Book Hotels', 'Book Tours'].map((item, idx) => (
              <motion.div
                key={idx}
                className="work-card"
                onClick={() => toast.info(`${item} feature coming soon!`)}
                variants={scaleIn}
                whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              >
                <img
                  src={`https://images.unsplash.com/photo-${['1436491865332-7a61a109cc05', '1578662996442-48f60103fc96', '1566073771259-6a8506099945', '1506905925346-21bda4d32df4'][idx]}?w=400`}
                  alt={item}
                  className="work-card-image"
                />
                <div className="work-card-overlay">
                  <h3 className="work-card-title">{item}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Recommended Flights */}
        <section className="section">
          <SectionHeader title={userLocation?.city ? `Flights from ${userLocation.city}` : 'Recommended Flights'}>
            <div className="section-nav">
              <button className="section-nav-btn prev" aria-label="Previous flights">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next" aria-label="Next flights">
                <ChevronRight size={20} />
              </button>
            </div>
          </SectionHeader>

          {flightsLoading ? (
            <div className="cards-grid">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : flightsError ? (
            <ErrorMessage message={flightsError} onRetry={refetchFlights} />
          ) : (
            <motion.div
              className="cards-grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {flights?.map((flight) => (
                <motion.article
                  key={flight.id}
                  className="card"
                  variants={cardVariant}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
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
                      <motion.button
                        className="card-action-btn"
                        onClick={() => toast.success('Booking...')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Book
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </section>

        {/* Recommended Cruise */}
        <section className="section">
          <SectionHeader title={userLocation?.city ? `Cruises near ${userLocation.city}` : 'Recommended Cruises'}>
            <div className="section-nav">
              <button className="section-nav-btn prev" aria-label="Previous cruises">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next" aria-label="Next cruises">
                <ChevronRight size={20} />
              </button>
            </div>
          </SectionHeader>

          {cruisesLoading ? (
            <div className="cards-grid">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : cruisesError ? (
            <ErrorMessage message={cruisesError} onRetry={refetchCruises} />
          ) : (
            <motion.div
              className="cards-grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {cruises?.map((cruise) => (
                <motion.article
                  key={cruise.id}
                  className="card"
                  variants={cardVariant}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
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
                        <span className="card-badge-text">{typeof cruise.rating === 'number' ? cruise.rating.toFixed(1) : cruise.rating}</span>
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
                      <motion.button
                        className="card-action-btn"
                        onClick={() => toast.success('Booking...')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Book
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </section>

        {/* Recommended Cars */}
        <section className="section">
          <SectionHeader title={userLocation?.city ? `Car Rentals in ${userLocation.city}` : 'Recommended Cars'}>
            <div className="section-nav">
              <button className="section-nav-btn prev" aria-label="Previous cars">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next" aria-label="Next cars">
                <ChevronRight size={20} />
              </button>
            </div>
          </SectionHeader>

          {carsLoading ? (
            <div className="cards-grid">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : carsError ? (
            <ErrorMessage message={carsError} onRetry={refetchCars} />
          ) : (
            <motion.div
              className="cards-grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {cars?.map((car) => (
                <motion.article
                  key={car.id}
                  className="card"
                  variants={cardVariant}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
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
                      <motion.button
                        className="card-action-btn"
                        onClick={() => toast.success('Booking...')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Rent
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </section>

        {/* Blog Section */}
        <section id="blog" className="section blog-section">
          <SectionHeader title="Our Blog and Articles">
            <div className="section-nav">
              <button className="section-nav-btn prev" aria-label="Previous articles">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next" aria-label="Next articles">
                <ChevronRight size={20} />
              </button>
            </div>
          </SectionHeader>

          {articlesLoading ? (
            <div className="blog-grid">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} type="card" />
              ))}
            </div>
          ) : articlesError ? (
            <ErrorMessage message={articlesError} onRetry={refetchArticles} />
          ) : (
            <motion.div
              className="blog-grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {articles?.map((article) => (
                <motion.article
                  key={article.id}
                  className="blog-card"
                  variants={cardVariant}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
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
                    <motion.button
                      className="blog-card-link"
                      onClick={() => toast.info('Coming soon!')}
                      whileHover={{ x: 5 }}
                    >
                      Read More →
                    </motion.button>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </section>

        {/* Why Choose Tour */}
        <section className="why-choose-section">
          <div className="why-choose-grid">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideInLeft}
            >
              <h2 className="why-choose-title">Why Choose Tour</h2>
              <motion.div
                className="why-choose-list"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div className="why-choose-item" variants={fadeInUp}>
                  <h3 className="why-choose-item-title">Personalized Service</h3>
                  <p className="why-choose-item-description">Tailored experiences for every traveler</p>
                </motion.div>
                <motion.div className="why-choose-item" variants={fadeInUp}>
                  <h3 className="why-choose-item-title">24/7 Support</h3>
                  <p className="why-choose-item-description">We're here whenever you need us</p>
                </motion.div>
                <motion.div className="why-choose-item" variants={fadeInUp}>
                  <h3 className="why-choose-item-title">Best Price</h3>
                  <p className="why-choose-item-description">Competitive rates guaranteed</p>
                </motion.div>
                <motion.div className="why-choose-item" variants={fadeInUp}>
                  <h3 className="why-choose-item-title">Trusted Company</h3>
                  <p className="why-choose-item-description">Years of excellence in travel</p>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              className="why-choose-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideInRight}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
                alt="Mountains"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="section">
          <SectionHeader title="Meet Our Team">
            <div className="section-nav">
              <button className="section-nav-btn prev" aria-label="Previous team members">
                <ChevronLeft size={20} />
              </button>
              <button className="section-nav-btn next" aria-label="Next team members">
                <ChevronRight size={20} />
              </button>
            </div>
          </SectionHeader>

          {teamLoading ? (
            <div className="cards-grid">
              {[...Array(4)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          ) : teamError ? (
            <ErrorMessage message={teamError} onRetry={refetchTeam} />
          ) : (
            <motion.div
              className="cards-grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {team?.map((member) => (
                <motion.article
                  key={member.id}
                  className="team-card"
                  variants={cardVariant}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
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
                      <motion.button
                        className="team-social-btn"
                        aria-label={`${member.name} Facebook`}
                        onClick={() => toast.info('Coming soon!')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span>f</span>
                      </motion.button>
                      <motion.button
                        className="team-social-btn"
                        aria-label={`${member.name} Twitter`}
                        onClick={() => toast.info('Coming soon!')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span>t</span>
                      </motion.button>
                      <motion.button
                        className="team-social-btn"
                        aria-label={`${member.name} LinkedIn`}
                        onClick={() => toast.info('Coming soon!')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span>in</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          )}
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <div
            className="testimonials-background"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200)' }}
          ></div>
          <motion.div
            className="testimonials-content"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
          >
            <motion.h2
              className="testimonials-title"
              variants={fadeInUp}
            >
              What Travellers Say About Us
            </motion.h2>
            <motion.div
              className="testimonials-avatars"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
                alt="Testimonial"
                className="testimonial-avatar"
                variants={scaleIn}
                whileHover={{ scale: 1.1, zIndex: 10 }}
              />
              <motion.img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
                alt="Testimonial"
                className="testimonial-avatar"
                variants={scaleIn}
                whileHover={{ scale: 1.1, zIndex: 10 }}
              />
              <motion.img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                alt="Testimonial"
                className="testimonial-avatar"
                variants={scaleIn}
                whileHover={{ scale: 1.1, zIndex: 10 }}
              />
            </motion.div>
            <motion.div
              className="testimonial-box"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <Star className="text-yellow-400 fill-yellow-400" size={24} />
                  </motion.div>
                ))}
              </div>
              <p className="testimonial-text">
                "Amazing experience! The team was professional and the destinations were breathtaking. Highly recommend to anyone looking for adventure."
              </p>
              <p className="testimonial-author">- Sarah Johnson</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Partners */}
        <section className="partners-section">
          <motion.h2
            className="partners-title"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            Our Partners
          </motion.h2>
          <motion.div
            className="partners-grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {['Expedia', 'TripAdvisor', 'Booking', 'Airbnb', 'Kayak', 'Hotels', 'Agoda'].map((partner, idx) => (
              <motion.div
                key={idx}
                className="partner-logo"
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {partner}
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Footer Component */}
        <Footer />
      </div>
    </>
  );
};

export default TravelBookingPage;
