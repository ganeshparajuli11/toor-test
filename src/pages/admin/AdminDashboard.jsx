import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Hotel,
  Plane,
  ShoppingCart,
  Eye
} from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  // Mock data - will be replaced with real API data later
  const [stats] = useState({
    totalRevenue: { value: '$124,592', change: '+12.5%', trend: 'up' },
    totalBookings: { value: '1,429', change: '+8.2%', trend: 'up' },
    totalUsers: { value: '856', change: '+15.3%', trend: 'up' },
    pendingBookings: { value: '23', change: '-5.1%', trend: 'down' }
  });

  const [recentBookings] = useState([
    {
      id: 'BK001',
      user: 'John Doe',
      type: 'Hotel',
      destination: 'Paris, France',
      amount: '$1,250',
      status: 'Confirmed',
      date: '2025-11-20'
    },
    {
      id: 'BK002',
      user: 'Sarah Smith',
      type: 'Flight',
      destination: 'Tokyo, Japan',
      amount: '$890',
      status: 'Pending',
      date: '2025-11-21'
    },
    {
      id: 'BK003',
      user: 'Mike Johnson',
      type: 'Hotel',
      destination: 'Dubai, UAE',
      amount: '$2,100',
      status: 'Confirmed',
      date: '2025-11-22'
    },
    {
      id: 'BK004',
      user: 'Emily Brown',
      type: 'Cruise',
      destination: 'Caribbean',
      amount: '$3,500',
      status: 'Confirmed',
      date: '2025-11-22'
    },
    {
      id: 'BK005',
      user: 'David Wilson',
      type: 'Hotel',
      destination: 'London, UK',
      amount: '$780',
      status: 'Cancelled',
      date: '2025-11-23'
    }
  ]);

  const [topDestinations] = useState([
    { name: 'Paris, France', bookings: 245, revenue: '$125,400' },
    { name: 'Tokyo, Japan', bookings: 189, revenue: '$98,200' },
    { name: 'Dubai, UAE', bookings: 167, revenue: '$156,800' },
    { name: 'New York, USA', bookings: 143, revenue: '$89,500' },
    { name: 'London, UK', bookings: 128, revenue: '$76,300' }
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
        return <Hotel size={16} />;
      case 'flight':
        return <Plane size={16} />;
      case 'cruise':
        return <ShoppingCart size={16} />;
      default:
        return <Calendar size={16} />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <button className="dashboard-export-btn">
          <TrendingUp size={20} />
          Export Report
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
            <p className="stat-label">Total Users</p>
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
            <button className="card-action-btn">View All</button>
          </div>
          <div className="table-container">
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
                    <td className="booking-id">{booking.id}</td>
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
                      <button className="action-btn">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Destinations */}
        <div className="dashboard-card top-destinations">
          <div className="card-header">
            <h2 className="card-title">Top Destinations</h2>
            <button className="card-action-btn">View All</button>
          </div>
          <div className="destinations-list">
            {topDestinations.map((destination, index) => (
              <div key={index} className="destination-item">
                <div className="destination-rank">#{index + 1}</div>
                <div className="destination-info">
                  <h4 className="destination-name">{destination.name}</h4>
                  <p className="destination-bookings">{destination.bookings} bookings</p>
                </div>
                <div className="destination-revenue">{destination.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
