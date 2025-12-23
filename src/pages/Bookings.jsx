import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  AlertCircle,
  Coffee,
  XCircle
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
  const [totalOrders, setTotalOrders] = useState(0);
  const [processingId, setProcessingId] = useState(null);
  const [hotelInfoCache, setHotelInfoCache] = useState({});
  const [userStats, setUserStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalSpent: 0
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your bookings');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch hotel info for a booking
  const fetchHotelInfo = useCallback(async (hotelId) => {
    if (hotelInfoCache[hotelId]) {
      return hotelInfoCache[hotelId];
    }
    try {
      const response = await api.post('/hotels/info', { id: hotelId });
      if (response.data?.success && response.data?.hotel) {
        const hotelInfo = response.data.hotel;
        setHotelInfoCache(prev => ({ ...prev, [hotelId]: hotelInfo }));
        return hotelInfo;
      }
    } catch (error) {
      console.warn('[Bookings] Could not fetch hotel info:', error.message);
    }
    return null;
  }, [hotelInfoCache]);

  // Transform RateHawk booking data to display format
  const transformBooking = (order, hotelInfo = null) => {
    // Calculate total guests from rooms
    let totalAdults = 0;
    let totalChildren = 0;
    const roomNames = [];

    (order.rooms || []).forEach(room => {
      totalAdults += room.adults || 0;
      totalChildren += room.children || 0;
      if (room.room_name) roomNames.push(room.room_name);
    });

    // Get price - prefer amount_sell (the actual price), fallback to amount_payable
    const price = parseFloat(order.amount_sell?.amount || order.amount_payable?.amount || 0);
    const currency = order.currency || 'EUR';

    // Map RateHawk status to our display status
    const statusMap = {
      'completed': 'confirmed',
      'cancelled': 'cancelled',
      'failed': 'failed',
      'noshow': 'noshow',
      'rejected': 'rejected'
    };

    return {
      id: order.partner_order_id || order.order_id,
      order_id: order.order_id,
      partner_order_id: order.partner_order_id,
      type: order.order_type || 'hotel',
      name: hotelInfo?.name || order.hotel?.id || 'Hotel Booking',
      location: hotelInfo?.location || hotelInfo?.address || order.hotel?.id || '',
      image: hotelInfo?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      checkIn: order.checkin_at,
      checkOut: order.checkout_at,
      nights: order.nights || 1,
      guests: {
        adults: totalAdults || 2,
        children: totalChildren
      },
      rooms: order.rooms?.length || 1,
      roomNames,
      status: statusMap[order.status] || order.status || 'confirmed',
      paymentStatus: order.payment?.paid_at ? 'full' : (order.payment?.type === 'deposit' ? 'deposit' : 'pending'),
      price,
      currency,
      bookingDate: order.created_at,
      modifiedDate: order.modified_at,
      cancelledDate: order.cancelled_at,

      // Cancellation info
      isCancellable: order.cancellation_info?.is_cancellable,
      freeCancellationBefore: order.cancellation_info?.free_cancellation_before,

      // Supplier info
      confirmationId: order.supplier?.confirmation_id,
      supplierName: order.supplier?.name,

      // User info
      userEmail: order.user?.email,
      userComment: order.user?.comment,

      // Meal info from first room
      meal: order.rooms?.[0]?.meal,
      hasBreakfast: order.rooms?.[0]?.has_breakfast,

      // Raw data for details view
      rawData: order
    };
  };

  // Calculate user stats from bookings
  const calculateUserStats = (bookingsList, totalFromApi = 0) => {
    const stats = {
      totalBookings: totalFromApi || bookingsList.length,
      confirmedBookings: bookingsList.filter(b => b.status === 'confirmed').length,
      pendingBookings: bookingsList.filter(b => b.status === 'pending').length,
      cancelledBookings: bookingsList.filter(b => b.status === 'cancelled').length,
      totalSpent: bookingsList
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.price || 0), 0)
    };
    setUserStats(stats);
  };

  // Fetch bookings data from RateHawk API
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        // Build request params for RateHawk API
        const requestParams = {
          page_size: 10,
          page_number: currentPage,
          ordering_by: sortBy === 'latest' || sortBy === 'oldest' ? 'created_at' :
                       sortBy === 'checkin' ? 'checkin_at' : 'created_at',
          ordering_type: sortBy === 'oldest' ? 'asc' : 'desc'
        };

        // Add status filter if not "all"
        if (selectedFilter === 'completed') {
          requestParams.status = 'completed';
        } else if (selectedFilter === 'cancelled') {
          requestParams.status = 'cancelled';
        }

        console.log('[Bookings] Fetching with params:', requestParams);

        // Fetch from RateHawk API
        const response = await api.post('/hotels/bookings', requestParams);

        if (response.data?.success && response.data?.data) {
          const {
            orders = [],
            total_orders = 0,
            total_pages = 1,
            found_orders = 0,
            found_pages = 1
          } = response.data.data;

          console.log('[Bookings] Received', orders.length, 'orders, total:', total_orders);

          // Fetch hotel info for each unique hotel
          const uniqueHotelIds = [...new Set(orders.map(o => o.hotel?.id).filter(Boolean))];

          // Fetch hotel info in parallel (limit to 5 concurrent requests)
          const hotelInfoMap = {};
          for (let i = 0; i < uniqueHotelIds.length; i += 5) {
            const batch = uniqueHotelIds.slice(i, i + 5);
            const hotelInfoPromises = batch.map(id => fetchHotelInfo(id));
            const results = await Promise.all(hotelInfoPromises);
            batch.forEach((id, idx) => {
              if (results[idx]) hotelInfoMap[id] = results[idx];
            });
          }

          // Transform orders to display format
          const transformedBookings = orders.map(order => {
            const hotelInfo = hotelInfoMap[order.hotel?.id] || null;
            return transformBooking(order, hotelInfo);
          });

          // Apply price sort (API doesn't support price sorting)
          if (sortBy === 'price-high' || sortBy === 'price-low') {
            transformedBookings.sort((a, b) =>
              sortBy === 'price-high' ? b.price - a.price : a.price - b.price
            );
          }

          setBookings(transformedBookings);
          setTotalPages(found_pages || total_pages || 1);
          setTotalOrders(found_orders || total_orders || 0);
          calculateUserStats(transformedBookings, total_orders);
        } else {
          console.warn('[Bookings] No data in response');
          setBookings([]);
          setTotalPages(1);
          setTotalOrders(0);
          calculateUserStats([]);
        }
      } catch (error) {
        console.error('[Bookings] API Error:', error.message);
        toast.error('Failed to load bookings. Please try again.');
        setBookings([]);
        setTotalPages(1);
        setTotalOrders(0);
        calculateUserStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, isAuthenticated, selectedFilter, sortBy, currentPage, fetchHotelInfo]);

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  // Handle view details
  const handleViewDetails = (bookingId) => {
    toast.info('Loading booking details...');
    setTimeout(() => {
      navigate(`/booking/${bookingId}`);
    }, 500);
  };

  // Handle cancel booking through RateHawk API
  const handleCancelBooking = async (booking) => {
    const partnerOrderId = booking.partner_order_id || booking.id;

    // Check if booking is cancellable
    if (!booking.isCancellable) {
      toast.error('This booking cannot be cancelled');
      return;
    }

    // Check free cancellation deadline
    let isFreeCancellation = false;
    if (booking.freeCancellationBefore) {
      const deadline = new Date(booking.freeCancellationBefore);
      const now = new Date();
      isFreeCancellation = now < deadline;

      if (!isFreeCancellation) {
        if (!window.confirm('Free cancellation period has passed. A cancellation fee may apply. Continue?')) {
          return;
        }
      }
    }

    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setProcessingId(booking.id);
    try {
      // Cancel through RateHawk API
      const response = await api.post('/hotels/booking/cancel', {
        partner_order_id: partnerOrderId
      });

      if (response.data?.success) {
        const cancelData = response.data.data;

        // Update booking status locally
        setBookings(bookings.map(b =>
          b.id === booking.id
            ? { ...b, status: 'cancelled', isCancellable: false }
            : b
        ));

        // Update stats
        setUserStats(prev => ({
          ...prev,
          confirmedBookings: Math.max(0, prev.confirmedBookings - 1),
          cancelledBookings: prev.cancelledBookings + 1
        }));

        // Show detailed cancellation message
        if (cancelData?.refunded?.amount > 0) {
          const refundAmount = cancelData.refunded.amount.toFixed(2);
          const currency = cancelData.refunded.currency === 'EUR' ? '€' :
                          cancelData.refunded.currency === 'USD' ? '$' :
                          cancelData.refunded.currency === 'GBP' ? '£' :
                          cancelData.refunded.currency + ' ';

          if (cancelData.cancellation_fee?.amount > 0) {
            const feeAmount = cancelData.cancellation_fee.amount.toFixed(2);
            toast.success(`Booking cancelled. Refund: ${currency}${refundAmount} (Fee: ${currency}${feeAmount})`);
          } else {
            toast.success(`Booking cancelled. Full refund: ${currency}${refundAmount}`);
          }
        } else if (cancelData?.cancellation_fee?.amount > 0) {
          const feeAmount = cancelData.cancellation_fee.amount.toFixed(2);
          const currency = cancelData.cancellation_fee.currency === 'EUR' ? '€' :
                          cancelData.cancellation_fee.currency === 'USD' ? '$' :
                          cancelData.cancellation_fee.currency === 'GBP' ? '£' :
                          cancelData.cancellation_fee.currency + ' ';
          toast.success(`Booking cancelled. Cancellation fee: ${currency}${feeAmount}`);
        } else {
          toast.success('Booking cancelled successfully');
        }
      } else {
        toast.error(response.data?.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel API Error:', error.message);
      const errorMessage = error.response?.data?.error || 'Failed to cancel booking';
      toast.error(errorMessage);
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
      case 'completed':
        return 'booking-status-confirmed';
      case 'pending':
        return 'booking-status-pending';
      case 'cancelled':
        return 'booking-status-cancelled';
      case 'failed':
      case 'rejected':
        return 'booking-status-failed';
      case 'noshow':
        return 'booking-status-noshow';
      default:
        return '';
    }
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'failed':
        return 'Failed';
      case 'rejected':
        return 'Rejected';
      case 'noshow':
        return 'No Show';
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }
  };

  // Get payment status badge class
  const getPaymentStatusBadgeClass = (paymentStatus) => {
    switch (paymentStatus) {
      case 'full':
        return 'payment-status-full';
      case 'deposit':
        return 'payment-status-deposit';
      case 'partial':
        return 'payment-status-partial';
      case 'pending':
        return 'payment-status-pending';
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
        return 'Paid';
      case 'deposit':
        return 'Deposit';
      case 'partial':
        return 'Partial';
      case 'pending':
        return 'Pending';
      case 'free':
        return 'Free';
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
        title="My Bookings | Zanafly - Travel Booking Platform"
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
                      <XCircle size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{userStats.cancelledBookings}</div>
                      <div style={{ fontSize: '14px', opacity: 0.9 }}>Cancelled</div>
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
                {/* Booking Status Filters */}
                <div className="booking-filters-section">
                  <div className="booking-type-filters">
                    <button
                      className={`filter-button ${selectedFilter === 'all' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('all')}
                    >
                      <Search size={18} />
                      <span>All Bookings</span>
                      {totalOrders > 0 && <span className="filter-count">{totalOrders}</span>}
                    </button>
                    <button
                      className={`filter-button ${selectedFilter === 'completed' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('completed')}
                    >
                      <CheckCircle size={18} />
                      <span>Confirmed</span>
                    </button>
                    <button
                      className={`filter-button ${selectedFilter === 'cancelled' ? 'active' : ''}`}
                      onClick={() => handleFilterChange('cancelled')}
                    >
                      <XCircle size={18} />
                      <span>Cancelled</span>
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
                                  {getStatusLabel(booking.status)}
                                </span>
                                {booking.paymentStatus && (
                                  <span className={`payment-status-badge ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                                    {getPaymentStatusLabel(booking.paymentStatus)}
                                  </span>
                                )}
                                {booking.hasBreakfast && (
                                  <span className="meal-badge">
                                    <Coffee size={12} /> Breakfast
                                  </span>
                                )}
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
                                <span className="price-value">
                                  {booking.currency === 'EUR' ? '€' :
                                   booking.currency === 'USD' ? '$' :
                                   booking.currency === 'GBP' ? '£' : booking.currency + ' '}
                                  {booking.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="booking-actions">
                                {booking.confirmationId && (
                                  <span className="confirmation-id">
                                    Conf: {booking.confirmationId}
                                  </span>
                                )}
                                <button
                                  className="booking-action-button view-details"
                                  onClick={() => handleViewDetails(booking.partner_order_id || booking.order_id)}
                                >
                                  View Details
                                </button>
                                {booking.status !== 'cancelled' && booking.isCancellable && (
                                  <button
                                    className="booking-action-button cancel-booking"
                                    onClick={() => handleCancelBooking(booking)}
                                    disabled={processingId === booking.id}
                                  >
                                    {processingId === booking.id ? (
                                      <>
                                        <RefreshCw size={16} className="spinning" />
                                        Cancelling...
                                      </>
                                    ) : (
                                      <>
                                        <X size={16} />
                                        Cancel
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
