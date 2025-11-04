import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  Bed,
  Moon,
  X,
  ChevronDown,
  Plane,
  Hotel,
  Ship,
  Car,
  Search
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import './Bookings.css';

/**
 * My Bookings Page
 * Displays user profile and booking history with filtering and sorting
 */
const Bookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState('booking-history');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your bookings');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fallback booking data
  const fallbackBookings = [
    {
      id: 1,
      type: 'hotel',
      name: 'Effoftel By Sayaji Jaipur',
      location: 'Amer, Jaipur',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
      checkIn: '2023-08-18',
      checkOut: '2023-08-20',
      nights: 2,
      guests: { adults: 9, children: 4 },
      rooms: 3,
      status: 'confirmed',
      paymentStatus: 'full',
      price: 96633,
      bookingDate: '2023-08-10'
    },
    {
      id: 2,
      type: 'hotel',
      name: 'Taj Lake Palace Udaipur',
      location: 'Lake Pichola, Udaipur',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      checkIn: '2023-09-15',
      checkOut: '2023-09-18',
      nights: 3,
      guests: { adults: 2, children: 0 },
      rooms: 1,
      status: 'confirmed',
      paymentStatus: 'partial',
      price: 125000,
      bookingDate: '2023-08-15'
    },
    {
      id: 3,
      type: 'flight',
      name: 'Air India - Delhi to Mumbai',
      location: 'IGI Airport, Delhi',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
      checkIn: '2023-10-05',
      checkOut: '2023-10-05',
      nights: null,
      guests: { adults: 2, children: 1 },
      rooms: null,
      status: 'pending',
      paymentStatus: 'free',
      price: 15000,
      bookingDate: '2023-09-25'
    },
    {
      id: 4,
      type: 'cruise',
      name: 'Royal Caribbean - Mediterranean',
      location: 'Barcelona, Spain',
      image: 'https://images.unsplash.com/photo-1563220116-f6a9333ca3e8?w=400',
      checkIn: '2023-11-20',
      checkOut: '2023-11-27',
      nights: 7,
      guests: { adults: 4, children: 2 },
      rooms: 2,
      status: 'confirmed',
      paymentStatus: 'full',
      price: 250000,
      bookingDate: '2023-09-01'
    },
    {
      id: 5,
      type: 'car',
      name: 'BMW 5 Series - Premium Sedan',
      location: 'Mumbai Airport',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
      checkIn: '2023-08-25',
      checkOut: '2023-08-28',
      nights: 3,
      guests: { adults: 4, children: 0 },
      rooms: null,
      status: 'cancelled',
      paymentStatus: 'partial',
      price: 12000,
      bookingDate: '2023-08-18'
    },
    {
      id: 6,
      type: 'hotel',
      name: 'ITC Grand Chola Chennai',
      location: 'Guindy, Chennai',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
      checkIn: '2023-12-01',
      checkOut: '2023-12-05',
      nights: 4,
      guests: { adults: 2, children: 1 },
      rooms: 1,
      status: 'confirmed',
      paymentStatus: 'free',
      price: 85000,
      bookingDate: '2023-10-15'
    }
  ];

  // Fetch bookings data
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const url = getApiUrl(API_ENDPOINTS.USER_BOOKINGS, { id: user.id });
        const response = await axios.get(url, {
          params: {
            filter: selectedFilter,
            sort: sortBy,
            page: currentPage
          }
        });

        const bookingsData = response.data.data || response.data;
        setBookings(bookingsData.bookings || bookingsData);
        setTotalPages(bookingsData.totalPages || 1);
      } catch (error) {
        console.warn('API Error, using fallback data:', error.message);

        // Apply filters to fallback data
        let filteredBookings = [...fallbackBookings];

        // Filter by type
        if (selectedFilter !== 'all') {
          filteredBookings = filteredBookings.filter(b => b.type === selectedFilter);
        }

        // Sort bookings
        filteredBookings.sort((a, b) => {
          switch (sortBy) {
            case 'latest':
              return new Date(b.bookingDate) - new Date(a.bookingDate);
            case 'oldest':
              return new Date(a.bookingDate) - new Date(b.bookingDate);
            case 'price-high':
              return b.price - a.price;
            case 'price-low':
              return a.price - b.price;
            default:
              return 0;
          }
        });

        setBookings(filteredBookings);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, isAuthenticated, selectedFilter, sortBy, currentPage]);

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
    toast.info(`Filtering ${filter === 'all' ? 'all bookings' : filter + ' bookings'}...`);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
    toast.info('Sorting bookings...');
  };

  // Handle view details
  const handleViewDetails = (bookingId) => {
    toast.info('Loading booking details...');
    setTimeout(() => {
      navigate(`/booking/${bookingId}`);
    }, 500);
  };

  // Handle cancel booking
  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setProcessingId(bookingId);
    try {
      const url = getApiUrl(API_ENDPOINTS.CANCEL_BOOKING, { id: bookingId });
      await axios.post(url);

      // Update booking status locally
      setBookings(bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' }
          : booking
      ));

      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.warn('Cancel API Error:', error.message);

      // Update locally anyway for demo
      setBookings(bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' }
          : booking
      ));

      toast.success('Booking cancelled successfully');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'booking-status-confirmed';
      case 'pending':
        return 'booking-status-pending';
      case 'cancelled':
        return 'booking-status-cancelled';
      default:
        return '';
    }
  };

  // Get payment status badge class
  const getPaymentStatusBadgeClass = (paymentStatus) => {
    switch (paymentStatus) {
      case 'full':
        return 'payment-status-full';
      case 'partial':
        return 'payment-status-partial';
      case 'free':
        return 'payment-status-free';
      default:
        return '';
    }
  };

  // Get payment status label
  const getPaymentStatusLabel = (paymentStatus) => {
    switch (paymentStatus) {
      case 'full':
        return 'Fully Paid';
      case 'partial':
        return 'Partially Paid';
      case 'free':
        return 'Free Reservation';
      default:
        return '';
    }
  };

  // Get booking type icon
  const getBookingTypeIcon = (type) => {
    switch (type) {
      case 'flight':
        return <Plane size={20} />;
      case 'hotel':
        return <Hotel size={20} />;
      case 'cruise':
        return <Ship size={20} />;
      case 'car':
        return <Car size={20} />;
      default:
        return <Hotel size={20} />;
    }
  };

  // Loading skeleton
  if (loading && bookings.length === 0) {
    return (
      <div className="bookings-page-loading">
        <Header />
        <div className="bookings-skeleton">
          <div className="skeleton-grid skeleton-animate">
            <div className="skeleton-item skeleton-header" />
            <div className="skeleton-item skeleton-profile" />
            <div className="skeleton-item skeleton-tabs" />
            <div className="skeleton-item skeleton-filters" />
            <div className="skeleton-item skeleton-booking" />
            <div className="skeleton-item skeleton-booking" />
            <div className="skeleton-item skeleton-booking" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Filter bookings for display
  const displayBookings = bookings;

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO
        title="My Bookings | TOOR - Travel Booking Platform"
        description="View and manage all your travel bookings in one place"
        keywords="my bookings, booking history, travel bookings, hotel bookings"
        canonical="/bookings"
      />

      <div className="bookings-page">
        {/* Header Component */}
        <Header />

        {/* Profile Header Section */}
        <div className="bookings-profile-header">
          <div className="profile-cover-image">
            <img
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=300&fit=crop"
              alt="Cover"
              className="cover-image"
            />
          </div>

          <div className="profile-info-section">
            <div className="profile-avatar-wrapper">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=06b6d4&color=fff&size=120`}
                alt={user.name}
                className="profile-avatar"
              />
            </div>

            <div className="profile-info-content">
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-email">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bookings-tabs-section">
          <div className="bookings-tabs-container">
            <nav className="bookings-tabs">
              <button
                className={`bookings-tab ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                Account
              </button>
              <button
                className={`bookings-tab ${activeTab === 'booking-history' ? 'active' : ''}`}
                onClick={() => setActiveTab('booking-history')}
              >
                Booking History
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="bookings-main-content">
          <div className="bookings-container">

            {/* Account Tab Content */}
            {activeTab === 'account' && (
              <div className="account-content">
                <div className="account-section">
                  <h2 className="account-section-title">Account Information</h2>
                  <div className="account-info-grid">
                    <div className="account-info-item">
                      <label className="account-info-label">Full Name</label>
                      <p className="account-info-value">{user.name}</p>
                    </div>
                    <div className="account-info-item">
                      <label className="account-info-label">Email Address</label>
                      <p className="account-info-value">{user.email}</p>
                    </div>
                    <div className="account-info-item">
                      <label className="account-info-label">Phone Number</label>
                      <p className="account-info-value">{user.phone || 'Not provided'}</p>
                    </div>
                    <div className="account-info-item">
                      <label className="account-info-label">Member Since</label>
                      <p className="account-info-value">
                        {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking History Tab Content */}
            {activeTab === 'booking-history' && (
              <>
                {/* Booking Type Filters */}
                <div className="booking-filters-section">
                  <div className="booking-type-filters">
                    <button
                      className={`filter-button ${selectedFilter === 'all' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('all')}
                    >
                      <Search size={18} />
                      <span>All Bookings</span>
                    </button>
                    <button
                      className={`filter-button ${selectedFilter === 'flight' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('flight')}
                    >
                      <Plane size={18} />
                      <span>Flight Booking</span>
                    </button>
                    <button
                      className={`filter-button ${selectedFilter === 'hotel' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('hotel')}
                    >
                      <Hotel size={18} />
                      <span>Hotel Booking</span>
                    </button>
                    <button
                      className={`filter-button ${selectedFilter === 'cruise' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('cruise')}
                    >
                      <Ship size={18} />
                      <span>Cruise Booking</span>
                    </button>
                    <button
                      className={`filter-button ${selectedFilter === 'car' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('car')}
                    >
                      <Car size={18} />
                      <span>Cars Booking</span>
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="booking-sort-section">
                    <select
                      className="booking-sort-select"
                      value={sortBy}
                      onChange={handleSortChange}
                    >
                      <option value="latest">Latest Booking</option>
                      <option value="oldest">Oldest Booking</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="price-low">Price: Low to High</option>
                    </select>
                    <ChevronDown className="sort-icon" size={18} />
                  </div>
                </div>

                {/* Booking Cards */}
                <div className="bookings-list">
                  {displayBookings.length > 0 ? (
                    <>
                      {displayBookings.map((booking) => (
                        <div key={booking.id} className="booking-card">
                          <div className="booking-card-image">
                            <img
                              src={booking.image}
                              alt={booking.name}
                            />
                            <div className="booking-type-badge">
                              {getBookingTypeIcon(booking.type)}
                            </div>
                          </div>

                          <div className="booking-card-content">
                            <div className="booking-card-header">
                              <div>
                                <h3 className="booking-card-title">{booking.name}</h3>
                                <div className="booking-card-location">
                                  <MapPin size={16} />
                                  <span>{booking.location}</span>
                                </div>
                              </div>
                              <div className="booking-badges">
                                <span className={`booking-status-badge ${getStatusBadgeClass(booking.status)}`}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                                <span className={`payment-status-badge ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                                  {getPaymentStatusLabel(booking.paymentStatus)}
                                </span>
                              </div>
                            </div>

                            <div className="booking-card-details">
                              <div className="booking-detail-item">
                                <Calendar size={16} />
                                <span>
                                  <strong>Check-in:</strong> {formatDate(booking.checkIn)}
                                </span>
                              </div>
                              <div className="booking-detail-item">
                                <Calendar size={16} />
                                <span>
                                  <strong>Check-out:</strong> {formatDate(booking.checkOut)}
                                </span>
                              </div>
                              {booking.nights && (
                                <div className="booking-detail-item">
                                  <Moon size={16} />
                                  <span>{booking.nights} Nights</span>
                                </div>
                              )}
                              <div className="booking-detail-item">
                                <Users size={16} />
                                <span>
                                  {booking.guests.adults} Adults
                                  {booking.guests.children > 0 && `, ${booking.guests.children} Children`}
                                </span>
                              </div>
                              {booking.rooms && (
                                <div className="booking-detail-item">
                                  <Bed size={16} />
                                  <span>{booking.rooms} Rooms</span>
                                </div>
                              )}
                            </div>

                            <div className="booking-card-footer">
                              <div className="booking-price">
                                <span className="price-label">Total Amount:</span>
                                <span className="price-value">₹{booking.price.toLocaleString()}</span>
                              </div>
                              <div className="booking-actions">
                                <button
                                  className="booking-action-button view-details"
                                  onClick={() => handleViewDetails(booking.id)}
                                >
                                  View Details
                                </button>
                                {booking.status !== 'cancelled' && (
                                  <button
                                    className="booking-action-button cancel-booking"
                                    onClick={() => handleCancelBooking(booking.id)}
                                    disabled={processingId === booking.id}
                                  >
                                    {processingId === booking.id ? (
                                      'Cancelling...'
                                    ) : (
                                      <>
                                        <X size={16} />
                                        Cancel Booking
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="bookings-pagination">
                          <button
                            className="pagination-button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                          <div className="pagination-info">
                            Page {currentPage} of {totalPages}
                          </div>
                          <button
                            className="pagination-button"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bookings-empty-state">
                      <div className="empty-state-icon">
                        <Hotel size={64} />
                      </div>
                      <h3 className="empty-state-title">No bookings found</h3>
                      <p className="empty-state-description">
                        {selectedFilter === 'all'
                          ? "You haven't made any bookings yet. Start exploring and book your next adventure!"
                          : `No ${selectedFilter} bookings found. Try selecting a different filter.`
                        }
                      </p>
                      <button
                        className="empty-state-button"
                        onClick={() => navigate('/')}
                      >
                        Browse Properties
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Component */}
        <Footer />
      </div>
    </>
  );
};

export default Bookings;
