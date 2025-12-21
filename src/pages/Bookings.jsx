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
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import api from '../services/api.service';
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
  const [userStats, setUserStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalSpent: 0
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your bookings');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // No fallback data - only show real user bookings

  // Transform booking data to display format
  const transformBooking = (booking) => ({
    id: booking.id,
    type: booking.type || 'hotel',
    name: booking.title || 'Hotel Booking',
    location: booking.subtitle || 'Location',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    checkIn: booking.details?.find(d => d.label === 'Check-in')?.value || 'N/A',
    checkOut: booking.details?.find(d => d.label === 'Check-out')?.value || 'N/A',
    nights: parseInt(booking.details?.find(d => d.label === 'Nights')?.value) || 1,
    guests: {
      adults: parseInt(booking.details?.find(d => d.label === 'Guests')?.value?.match(/\d+/)?.[0]) || 2,
      children: 0
    },
    rooms: parseInt(booking.details?.find(d => d.label === 'Rooms')?.value?.match(/\d+/)?.[0]) || 1,
    status: booking.status || 'confirmed',
    paymentStatus: booking.isDemo ? 'demo' : 'full',
    price: booking.totalPrice || 0,
    bookingDate: booking.createdAt || new Date().toISOString(),
    isDemo: booking.isDemo
  });

  // Calculate user stats from bookings
  const calculateUserStats = (bookingsList) => {
    const stats = {
      totalBookings: bookingsList.length,
      confirmedBookings: bookingsList.filter(b => b.status === 'confirmed').length,
      pendingBookings: bookingsList.filter(b => b.status === 'pending').length,
      totalSpent: bookingsList
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.price || 0), 0)
    };
    setUserStats(stats);
  };

  // Fetch bookings data
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        // Try to fetch from backend API first
        const response = await api.get('/bookings');
        const bookingsData = response.data.data || [];

        // Filter bookings for current user (by email)
        const userBookings = bookingsData.filter(booking => {
          if (user?.email && booking.guest?.email) {
            return booking.guest.email.toLowerCase() === user.email.toLowerCase();
          }
          return false;
        });

        // Transform backend data to match the expected format
        const transformedBookings = userBookings.map(transformBooking);

        // Apply type filter
        let filteredBookings = [...transformedBookings];
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
        calculateUserStats(transformedBookings); // Calculate stats from all user bookings
        setTotalPages(1);
      } catch (error) {
        console.warn('API Error, fetching from local storage:', error.message);

        // Get only real user bookings from localStorage (no fake fallback data)
        const localBookings = JSON.parse(localStorage.getItem('bookings') || '[]');

        // Filter bookings for current user (by email if available)
        const userBookings = localBookings.filter(booking => {
          if (user?.email && booking.guest?.email) {
            return booking.guest.email.toLowerCase() === user.email.toLowerCase();
          }
          return false;
        });

        // Transform localStorage bookings
        const transformedBookings = userBookings.map(transformBooking);

        // Apply type filter
        let filteredBookings = [...transformedBookings];
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
        calculateUserStats(transformedBookings);
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
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setProcessingId(bookingId);
    try {
      // Cancel through backend API
      await api.post(`/bookings/${bookingId}/cancel`);

      // Update booking status locally
      setBookings(bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' }
          : booking
      ));

      // Update stats
      setUserStats(prev => ({
        ...prev,
        confirmedBookings: prev.confirmedBookings - 1
      }));

      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.warn('Cancel API Error:', error.message);

      // Try to update localStorage as fallback
      const localBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const updatedBookings = localBookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      );
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));

      // Update locally
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
      case 'demo':
        return 'payment-status-demo';
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
      case 'demo':
        return 'Demo Payment';
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
                {/* User Stats Cards */}
                <div className="user-stats-section" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div className="user-stat-card" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px' }}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userStats.totalBookings}</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Bookings</div>
                    </div>
                  </div>

                  <div className="user-stat-card" style={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px' }}>
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userStats.confirmedBookings}</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Confirmed</div>
                    </div>
                  </div>

                  <div className="user-stat-card" style={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px' }}>
                      <Clock size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userStats.pendingBookings}</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Pending</div>
                    </div>
                  </div>

                  <div className="user-stat-card" style={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px' }}>
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${userStats.totalSpent.toLocaleString()}</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Spent</div>
                    </div>
                  </div>
                </div>

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
