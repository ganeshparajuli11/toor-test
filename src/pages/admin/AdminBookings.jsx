import { useState } from 'react';
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
  Car
} from 'lucide-react';
import './AdminBookings.css';

const AdminBookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data - will be replaced with real API data
  const [bookings] = useState([
    {
      id: 'BK001',
      bookingRef: 'HOT-2025-001',
      customer: 'John Doe',
      email: 'john.doe@example.com',
      type: 'Hotel',
      destination: 'Paris, France',
      hotelName: 'Le Grand Hotel',
      checkIn: '2025-12-15',
      checkOut: '2025-12-20',
      guests: 2,
      amount: 1250,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      bookingDate: '2025-11-20',
      voucherSent: true
    },
    {
      id: 'BK002',
      bookingRef: 'FLT-2025-002',
      customer: 'Sarah Smith',
      email: 'sarah.smith@example.com',
      type: 'Flight',
      destination: 'Tokyo, Japan',
      airline: 'Japan Airlines',
      departure: '2025-12-10',
      flightNumber: 'JL-5042',
      passengers: 1,
      amount: 890,
      status: 'Pending',
      paymentStatus: 'Pending',
      bookingDate: '2025-11-21',
      voucherSent: false
    },
    {
      id: 'BK003',
      bookingRef: 'HOT-2025-003',
      customer: 'Mike Johnson',
      email: 'mike.j@example.com',
      type: 'Hotel',
      destination: 'Dubai, UAE',
      hotelName: 'Burj Al Arab',
      checkIn: '2025-12-25',
      checkOut: '2025-12-30',
      guests: 4,
      amount: 2100,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      bookingDate: '2025-11-22',
      voucherSent: true
    },
    {
      id: 'BK004',
      bookingRef: 'CRU-2025-004',
      customer: 'Emily Brown',
      email: 'emily.brown@example.com',
      type: 'Cruise',
      destination: 'Caribbean',
      cruiseLine: 'Royal Caribbean',
      departure: '2026-01-15',
      duration: '7 nights',
      passengers: 2,
      amount: 3500,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      bookingDate: '2025-11-22',
      voucherSent: true
    },
    {
      id: 'BK005',
      bookingRef: 'HOT-2025-005',
      customer: 'David Wilson',
      email: 'david.w@example.com',
      type: 'Hotel',
      destination: 'London, UK',
      hotelName: 'The Savoy',
      checkIn: '2025-12-01',
      checkOut: '2025-12-05',
      guests: 2,
      amount: 780,
      status: 'Cancelled',
      paymentStatus: 'Refunded',
      bookingDate: '2025-11-23',
      voucherSent: false
    }
  ]);

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
        return null;
    }
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

  return (
    <div className="admin-bookings">
      <div className="bookings-header">
        <div>
          <h1 className="bookings-title">Bookings Management</h1>
          <p className="bookings-subtitle">Manage and track all customer bookings</p>
        </div>
        <button className="export-btn">
          <Download size={20} />
          Export Data
        </button>
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
            <div className="stat-value">{bookings.filter(b => b.status === 'Confirmed').length}</div>
            <div className="stat-label">Confirmed</div>
          </div>
        </div>
        <div className="stat-item">
          <Clock className="stat-icon pending" size={20} />
          <div>
            <div className="stat-value">{bookings.filter(b => b.status === 'Pending').length}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-item">
          <XCircle className="stat-icon cancelled" size={20} />
          <div>
            <div className="stat-value">{bookings.filter(b => b.status === 'Cancelled').length}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon revenue">$</div>
          <div>
            <div className="stat-value">${bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</div>
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
              <th>Voucher</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td className="booking-ref">{booking.bookingRef}</td>
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
                  {booking.type === 'Hotel' && (
                    <div>
                      <div>{booking.hotelName}</div>
                      <div className="detail-sub">{booking.checkIn} - {booking.checkOut}</div>
                      <div className="detail-sub">{booking.guests} guests</div>
                    </div>
                  )}
                  {booking.type === 'Flight' && (
                    <div>
                      <div>{booking.airline}</div>
                      <div className="detail-sub">{booking.flightNumber}</div>
                      <div className="detail-sub">{booking.departure}</div>
                    </div>
                  )}
                  {booking.type === 'Cruise' && (
                    <div>
                      <div>{booking.cruiseLine}</div>
                      <div className="detail-sub">{booking.duration}</div>
                      <div className="detail-sub">Dep: {booking.departure}</div>
                    </div>
                  )}
                </td>
                <td>{booking.bookingDate}</td>
                <td className="amount-cell">${booking.amount}</td>
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
                  {booking.voucherSent ? (
                    <span className="voucher-sent">Sent</span>
                  ) : (
                    <span className="voucher-pending">Pending</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn view" title="View Details">
                      <Eye size={16} />
                    </button>
                    <button className="action-btn email" title="Send Email">
                      <Mail size={16} />
                    </button>
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
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
