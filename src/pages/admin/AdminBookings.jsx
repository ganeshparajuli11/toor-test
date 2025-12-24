import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Hotel,
  Plane,
  Ship,
  Car,
  RefreshCw,
  X,
  Calendar,
  Users,
  CreditCard,
  Phone,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.service';
import './AdminBookings.css';

const AdminBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    totalRevenue: 0
  });

  // Fetch bookings from backend
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings');
      const bookingsData = response.data.data || [];

      // Transform backend data to match the table format
      const transformedBookings = bookingsData.map(booking => ({
        id: booking.id,
        bookingRef: booking.id,
        // Guest info (who the booking is FOR)
        customer: booking.guest ? `${booking.guest.firstName} ${booking.guest.lastName}` : 'Guest',
        email: booking.guest?.email || 'N/A',
        phone: booking.guest?.phone || 'N/A',
        // Booked by info (who MADE the booking - logged in user)
        bookedBy: booking.bookedBy ? {
          name: booking.bookedBy.name || 'N/A',
          email: booking.bookedBy.email || 'N/A',
          phone: booking.bookedBy.phone || 'N/A',
          id: booking.bookedBy.id || 'N/A'
        } : null,
        type: (booking.type || 'hotel').charAt(0).toUpperCase() + (booking.type || 'hotel').slice(1),
        destination: booking.subtitle || booking.title || 'N/A',
        hotelName: booking.title || 'N/A',
        checkIn: booking.details?.find(d => d.label === 'Check-in')?.value || 'N/A',
        checkOut: booking.details?.find(d => d.label === 'Check-out')?.value || 'N/A',
        guests: booking.details?.find(d => d.label === 'Guests')?.value || 'N/A',
        nights: booking.details?.find(d => d.label === 'Nights')?.value || 'N/A',
        amount: booking.totalPrice || 0,
        status: (booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1),
        paymentStatus: booking.paymentStatus || (booking.isDemo ? 'Demo' : 'Paid'),
        paymentId: booking.paymentId || 'N/A',
        bookingDate: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A',
        bookingDateTime: booking.createdAt || null,
        voucherSent: booking.status === 'confirmed',
        isDemo: booking.isDemo || false,
        rawData: booking
      }));

      setBookings(transformedBookings);

      // Calculate stats
      setStats({
        confirmed: transformedBookings.filter(b => b.status === 'Confirmed').length,
        pending: transformedBookings.filter(b => b.status === 'Pending').length,
        cancelled: transformedBookings.filter(b => b.status === 'Cancelled').length,
        totalRevenue: transformedBookings.reduce((sum, b) => sum + b.amount, 0)
      });

    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
      // Use empty array on error
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'status-confirmed';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'hotel':
        return <Hotel size={18} />;
      case 'flight':
        return <Plane size={18} />;
      case 'cruise':
        return <Ship size={18} />;
      case 'car':
        return <Car size={18} />;
      default:
        return <Hotel size={18} />;
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}`, { status: newStatus.toLowerCase() });
      toast.success(`Booking status updated to ${newStatus}`);
      fetchBookings(); // Refresh the list
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
      if (showModal && selectedBooking?.id === bookingId) {
        setShowModal(false);
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Booking Ref', 'Customer', 'Email', 'Type', 'Destination', 'Check-in', 'Check-out', 'Amount', 'Status', 'Payment', 'Booking Date'];
    const csvContent = [
      headers.join(','),
      ...filteredBookings.map(b => [
        b.bookingRef,
        b.customer,
        b.email,
        b.type,
        b.destination,
        b.checkIn,
        b.checkOut,
        b.amount,
        b.status,
        b.paymentStatus,
        b.bookingDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Bookings exported successfully');
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || booking.status.toLowerCase() === filterStatus;
    const matchesType = filterType === 'all' || booking.type.toLowerCase() === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="admin-bookings">
        <div className="bookings-header">
          <div>
            <h1 className="bookings-title">Bookings Management</h1>
            <p className="bookings-subtitle">Loading bookings...</p>
          </div>
        </div>
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '60px' }}>
          <RefreshCw size={40} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-bookings">
      <div className="bookings-header">
        <div>
          <h1 className="bookings-title">Bookings Management</h1>
          <p className="bookings-subtitle">Manage and track all customer bookings</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="refresh-btn" onClick={fetchBookings} style={{
            padding: '10px 16px',
            background: '#f0f0f0',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <RefreshCw size={18} />
            Refresh
          </button>
          <button className="export-btn" onClick={handleExport}>
            <Download size={20} />
            Export Data
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bookings-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by customer name, booking ref, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <div className="filter-group">
            <Filter size={18} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="hotel">Hotels</option>
              <option value="flight">Flights</option>
              <option value="cruise">Cruises</option>
              <option value="car">Cars</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bookings-stats">
        <div className="stat-item">
          <CheckCircle className="stat-icon confirmed" size={20} />
          <div>
            <div className="stat-value">{stats.confirmed}</div>
            <div className="stat-label">Confirmed</div>
          </div>
        </div>
        <div className="stat-item">
          <Clock className="stat-icon pending" size={20} />
          <div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-item">
          <XCircle className="stat-icon cancelled" size={20} />
          <div>
            <div className="stat-value">{stats.cancelled}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon revenue">$</div>
          <div>
            <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bookings-table-container">
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Booking Ref</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Destination</th>
              <th>Details</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="booking-ref">
                  {booking.bookingRef}
                  {booking.isDemo && (
                    <span style={{
                      fontSize: '10px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      marginLeft: '6px'
                    }}>DEMO</span>
                  )}
                </td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{booking.customer}</div>
                    <div className="customer-email">{booking.email}</div>
                  </div>
                </td>
                <td>
                  <div className="booking-type-cell">
                    {getTypeIcon(booking.type)}
                    <span>{booking.type}</span>
                  </div>
                </td>
                <td>{booking.destination}</td>
                <td className="booking-details">
                  <div>
                    <div>{booking.hotelName}</div>
                    <div className="detail-sub">{booking.checkIn} - {booking.checkOut}</div>
                    <div className="detail-sub">{booking.guests}</div>
                  </div>
                </td>
                <td>{booking.bookingDate}</td>
                <td className="amount-cell">${booking.amount.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <span className={`payment-badge ${booking.paymentStatus.toLowerCase()}`}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      title="View Details"
                      onClick={() => handleViewDetails(booking)}
                    >
                      <Eye size={16} />
                    </button>
                    {booking.status !== 'Cancelled' && (
                      <button
                        className="action-btn cancel"
                        title="Cancel Booking"
                        onClick={() => handleCancelBooking(booking.id)}
                        style={{ color: '#dc3545' }}
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBookings.length === 0 && (
        <div className="no-results">
          <p>No bookings found matching your criteria</p>
          {bookings.length === 0 && (
            <p style={{ color: '#666', marginTop: '10px' }}>
              Bookings will appear here when customers make reservations.
            </p>
          )}
        </div>
      )}

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="booking-modal-overlay" onClick={closeModal}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-content">
              {/* Booking Reference */}
              <div className="modal-section">
                <div className="modal-row">
                  <span className="modal-label">Booking Reference:</span>
                  <span className="modal-value booking-ref-value">
                    {selectedBooking.bookingRef}
                    {selectedBooking.isDemo && (
                      <span className="demo-badge-modal">DEMO</span>
                    )}
                  </span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Status:</span>
                  <span className={`status-badge ${getStatusClass(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Payment:</span>
                  <span className={`payment-badge ${selectedBooking.paymentStatus.toLowerCase()}`}>
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Booked By Information (Who made the booking) */}
              {selectedBooking.bookedBy && (
                <div className="modal-section">
                  <h3 className="section-title">
                    <Users size={18} /> Booked By (Account Holder)
                  </h3>
                  <div className="modal-row">
                    <span className="modal-label">Name:</span>
                    <span className="modal-value">{selectedBooking.bookedBy.name}</span>
                  </div>
                  <div className="modal-row">
                    <span className="modal-label">Email:</span>
                    <span className="modal-value">
                      <a href={`mailto:${selectedBooking.bookedBy.email}`} style={{ color: '#667eea' }}>
                        {selectedBooking.bookedBy.email}
                      </a>
                    </span>
                  </div>
                  {selectedBooking.bookedBy.phone && selectedBooking.bookedBy.phone !== 'N/A' && (
                    <div className="modal-row">
                      <span className="modal-label">Phone:</span>
                      <span className="modal-value">{selectedBooking.bookedBy.phone}</span>
                    </div>
                  )}
                  {selectedBooking.bookedBy.id && selectedBooking.bookedBy.id !== 'N/A' && (
                    <div className="modal-row">
                      <span className="modal-label">User ID:</span>
                      <span className="modal-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {selectedBooking.bookedBy.id}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Guest Information (Who the booking is for) */}
              <div className="modal-section">
                <h3 className="section-title">
                  <Users size={18} /> Guest Information (Booking For)
                </h3>
                <div className="modal-row">
                  <span className="modal-label">Name:</span>
                  <span className="modal-value">{selectedBooking.customer}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Email:</span>
                  <span className="modal-value">
                    <a href={`mailto:${selectedBooking.email}`} style={{ color: '#667eea' }}>
                      {selectedBooking.email}
                    </a>
                  </span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Phone:</span>
                  <span className="modal-value">{selectedBooking.phone}</span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="modal-section">
                <h3 className="section-title">
                  {getTypeIcon(selectedBooking.type)} Booking Information
                </h3>
                <div className="modal-row">
                  <span className="modal-label">Type:</span>
                  <span className="modal-value">{selectedBooking.type}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Property:</span>
                  <span className="modal-value">{selectedBooking.hotelName}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Destination:</span>
                  <span className="modal-value">{selectedBooking.destination}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Check-in:</span>
                  <span className="modal-value">{selectedBooking.checkIn}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Check-out:</span>
                  <span className="modal-value">{selectedBooking.checkOut}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Guests:</span>
                  <span className="modal-value">{selectedBooking.guests}</span>
                </div>
                {selectedBooking.nights && selectedBooking.nights !== 'N/A' && (
                  <div className="modal-row">
                    <span className="modal-label">Nights:</span>
                    <span className="modal-value">{selectedBooking.nights}</span>
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div className="modal-section">
                <h3 className="section-title">
                  <CreditCard size={18} /> Payment Information
                </h3>
                <div className="modal-row">
                  <span className="modal-label">Amount:</span>
                  <span className="modal-value amount-value">${selectedBooking.amount.toLocaleString()}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Payment Status:</span>
                  <span className={`payment-badge ${selectedBooking.paymentStatus.toLowerCase()}`}>
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
                {selectedBooking.paymentId && selectedBooking.paymentId !== 'N/A' && (
                  <div className="modal-row">
                    <span className="modal-label">Payment ID:</span>
                    <span className="modal-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {selectedBooking.paymentId}
                    </span>
                  </div>
                )}
                <div className="modal-row">
                  <span className="modal-label">Booking Date:</span>
                  <span className="modal-value">{selectedBooking.bookingDate}</span>
                </div>
                {selectedBooking.bookingDateTime && (
                  <div className="modal-row">
                    <span className="modal-label">Booking Time:</span>
                    <span className="modal-value">
                      {new Date(selectedBooking.bookingDateTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="modal-actions">
                {selectedBooking.status !== 'Cancelled' && (
                  <button
                    className="modal-btn cancel-btn"
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                  >
                    <XCircle size={18} />
                    Cancel Booking
                  </button>
                )}
                <button className="modal-btn close-btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
