import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Hotel,
  Plane,
  ShoppingCart,
  Ship,
  Car,
  Eye,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.service';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: { value: '$0', change: '0%', trend: 'up' },
    totalBookings: { value: '0', change: '0%', trend: 'up' },
    totalUsers: { value: '0', change: '0%', trend: 'up' },
    pendingBookings: { value: '0', change: '0%', trend: 'down' }
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsByType, setBookingsByType] = useState({
    hotel: 0,
    flight: 0,
    cruise: 0,
    car: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings/stats');
      const data = response.data;

      // Update stats
      setStats({
        totalRevenue: {
          value: `$${(data.totalRevenue || 0).toLocaleString()}`,
          change: `${data.revenueGrowth > 0 ? '+' : ''}${data.revenueGrowth || 0}%`,
          trend: data.revenueGrowth >= 0 ? 'up' : 'down'
        },
        totalBookings: {
          value: (data.totalBookings || 0).toString(),
          change: `${data.bookingGrowth > 0 ? '+' : ''}${data.bookingGrowth || 0}%`,
          trend: data.bookingGrowth >= 0 ? 'up' : 'down'
        },
        totalUsers: {
          value: (data.confirmedBookings || 0).toString(),
          change: '+0%',
          trend: 'up'
        },
        pendingBookings: {
          value: (data.pendingBookings || 0).toString(),
          change: '0%',
          trend: 'down'
        }
      });

      // Update recent bookings
      if (data.recentBookings) {
        const transformedBookings = data.recentBookings.map(booking => ({
          id: booking.id,
          user: booking.guest ? `${booking.guest.firstName} ${booking.guest.lastName}` : 'Guest',
          type: (booking.type || 'hotel').charAt(0).toUpperCase() + (booking.type || 'hotel').slice(1),
          destination: booking.subtitle || booking.title || 'N/A',
          amount: `$${(booking.totalPrice || 0).toLocaleString()}`,
          status: (booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1),
          date: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A',
          isDemo: booking.isDemo || false
        }));
        setRecentBookings(transformedBookings);
      }

      // Update bookings by type
      if (data.bookingsByType) {
        setBookingsByType(data.bookingsByType);
      }

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Keep default values on error
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
        return <Hotel size={16} />;
      case 'flight':
        return <Plane size={16} />;
      case 'cruise':
        return <Ship size={16} />;
      case 'car':
        return <Car size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Loading dashboard data...</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite' }} />
          <p>Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <button className="dashboard-export-btn" onClick={fetchDashboardStats}>
          <RefreshCw size={20} />
          Refresh Stats
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon revenue">
              <DollarSign size={24} />
            </div>
            <span className={`stat-trend ${stats.totalRevenue.trend === 'up' ? 'up' : 'down'}`}>
              {stats.totalRevenue.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {stats.totalRevenue.change}
            </span>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-value">{stats.totalRevenue.value}</h3>
            <p className="stat-label">Total Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon bookings">
              <Calendar size={24} />
            </div>
            <span className={`stat-trend ${stats.totalBookings.trend === 'up' ? 'up' : 'down'}`}>
              {stats.totalBookings.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {stats.totalBookings.change}
            </span>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-value">{stats.totalBookings.value}</h3>
            <p className="stat-label">Total Bookings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon users">
              <Users size={24} />
            </div>
            <span className={`stat-trend ${stats.totalUsers.trend === 'up' ? 'up' : 'down'}`}>
              {stats.totalUsers.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {stats.totalUsers.change}
            </span>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-value">{stats.totalUsers.value}</h3>
            <p className="stat-label">Confirmed Bookings</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon pending">
              <ShoppingCart size={24} />
            </div>
            <span className={`stat-trend ${stats.pendingBookings.trend === 'up' ? 'up' : 'down'}`}>
              {stats.pendingBookings.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {stats.pendingBookings.change}
            </span>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-value">{stats.pendingBookings.value}</h3>
            <p className="stat-label">Pending Bookings</p>
          </div>
        </div>
      </div>

      {/* Charts and Tables Row */}
      <div className="dashboard-content">
        {/* Recent Bookings */}
        <div className="dashboard-card recent-bookings">
          <div className="card-header">
            <h2 className="card-title">Recent Bookings</h2>
            <button className="card-action-btn" onClick={() => navigate('/admin/bookings')}>View All</button>
          </div>
          <div className="table-container">
            {recentBookings.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Destination</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="booking-id">
                        {booking.id}
                        {booking.isDemo && (
                          <span style={{
                            fontSize: '9px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '2px 4px',
                            borderRadius: '3px',
                            marginLeft: '4px'
                          }}>DEMO</span>
                        )}
                      </td>
                      <td>{booking.user}</td>
                      <td>
                        <div className="booking-type">
                          {getTypeIcon(booking.type)}
                          <span>{booking.type}</span>
                        </div>
                      </td>
                      <td>{booking.destination}</td>
                      <td className="amount">{booking.amount}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td>{booking.date}</td>
                      <td>
                        <button className="action-btn" onClick={() => toast.info(`Booking: ${booking.id}`)}>
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <Calendar size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <p>No bookings yet</p>
                <p style={{ fontSize: '13px' }}>Bookings will appear here when customers make reservations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bookings by Type */}
        <div className="dashboard-card top-destinations">
          <div className="card-header">
            <h2 className="card-title">Bookings by Type</h2>
            <button className="card-action-btn" onClick={() => navigate('/admin/bookings')}>View All</button>
          </div>
          <div className="destinations-list">
            <div className="destination-item">
              <div className="destination-rank" style={{ background: '#3b82f6' }}>
                <Hotel size={16} />
              </div>
              <div className="destination-info">
                <h4 className="destination-name">Hotels</h4>
                <p className="destination-bookings">{bookingsByType.hotel} bookings</p>
              </div>
              <div className="destination-revenue">
                {((bookingsByType.hotel / (Object.values(bookingsByType).reduce((a, b) => a + b, 0) || 1)) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="destination-item">
              <div className="destination-rank" style={{ background: '#10b981' }}>
                <Plane size={16} />
              </div>
              <div className="destination-info">
                <h4 className="destination-name">Flights</h4>
                <p className="destination-bookings">{bookingsByType.flight} bookings</p>
              </div>
              <div className="destination-revenue">
                {((bookingsByType.flight / (Object.values(bookingsByType).reduce((a, b) => a + b, 0) || 1)) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="destination-item">
              <div className="destination-rank" style={{ background: '#8b5cf6' }}>
                <Ship size={16} />
              </div>
              <div className="destination-info">
                <h4 className="destination-name">Cruises</h4>
                <p className="destination-bookings">{bookingsByType.cruise} bookings</p>
              </div>
              <div className="destination-revenue">
                {((bookingsByType.cruise / (Object.values(bookingsByType).reduce((a, b) => a + b, 0) || 1)) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="destination-item">
              <div className="destination-rank" style={{ background: '#f59e0b' }}>
                <Car size={16} />
              </div>
              <div className="destination-info">
                <h4 className="destination-name">Car Rentals</h4>
                <p className="destination-bookings">{bookingsByType.car} bookings</p>
              </div>
              <div className="destination-revenue">
                {((bookingsByType.car / (Object.values(bookingsByType).reduce((a, b) => a + b, 0) || 1)) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
