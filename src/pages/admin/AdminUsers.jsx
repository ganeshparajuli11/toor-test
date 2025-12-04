import { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Ban,
  CheckCircle,
  Calendar,
  MapPin,
  Phone,
  UserCheck,
  UserX
} from 'lucide-react';
import './AdminUsers.css';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - will be replaced with real API data
  const [users] = useState([
    {
      id: 'USR001',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 234 567 8900',
      location: 'New York, USA',
      joinDate: '2024-01-15',
      lastLogin: '2025-11-23',
      totalBookings: 12,
      totalSpent: 15480,
      status: 'Active',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
    },
    {
      id: 'USR002',
      name: 'Sarah Smith',
      email: 'sarah.smith@example.com',
      phone: '+1 234 567 8901',
      location: 'Los Angeles, USA',
      joinDate: '2024-03-20',
      lastLogin: '2025-11-22',
      totalBookings: 8,
      totalSpent: 9240,
      status: 'Active',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
    },
    {
      id: 'USR003',
      name: 'Mike Johnson',
      email: 'mike.j@example.com',
      phone: '+1 234 567 8902',
      location: 'Chicago, USA',
      joinDate: '2024-05-10',
      lastLogin: '2025-11-20',
      totalBookings: 15,
      totalSpent: 22350,
      status: 'Active',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
    },
    {
      id: 'USR004',
      name: 'Emily Brown',
      email: 'emily.brown@example.com',
      phone: '+1 234 567 8903',
      location: 'Miami, USA',
      joinDate: '2024-07-22',
      lastLogin: '2025-11-18',
      totalBookings: 5,
      totalSpent: 7800,
      status: 'Active',
      verified: false,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    {
      id: 'USR005',
      name: 'David Wilson',
      email: 'david.w@example.com',
      phone: '+1 234 567 8904',
      location: 'Seattle, USA',
      joinDate: '2024-09-05',
      lastLogin: '2025-10-15',
      totalBookings: 3,
      totalSpent: 2890,
      status: 'Blocked',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    {
      id: 'USR006',
      name: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      phone: '+1 234 567 8905',
      location: 'Boston, USA',
      joinDate: '2024-10-12',
      lastLogin: '2025-11-23',
      totalBookings: 7,
      totalSpent: 11200,
      status: 'Active',
      verified: true,
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100'
    }
  ]);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'blocked':
        return 'status-blocked';
      case 'inactive':
        return 'status-inactive';
      default:
        return '';
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || user.status.toLowerCase() === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const blockedUsers = users.filter(u => u.status === 'Blocked').length;
  const verifiedUsers = users.filter(u => u.verified).length;

  return (
    <div className="admin-users">
      <div className="users-header">
        <div>
          <h1 className="users-title">Users Management</h1>
          <p className="users-subtitle">Manage and monitor all registered users</p>
        </div>
        <button className="export-btn">
          <Download size={20} />
          Export Users
        </button>
      </div>

      {/* Filters and Search */}
      <div className="users-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or user ID..."
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
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="users-stats">
        <div className="stat-item">
          <div className="stat-icon total">
            <UserCheck size={20} />
          </div>
          <div>
            <div className="stat-value">{totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon active">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{activeUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon blocked">
            <UserX size={20} />
          </div>
          <div>
            <div className="stat-value">{blockedUsers}</div>
            <div className="stat-label">Blocked Users</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon verified">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{verifiedUsers}</div>
            <div className="stat-label">Verified Users</div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="users-grid">
        {filteredUsers.map((user) => (
          <div key={user.id} className="user-card">
            <div className="user-card-header">
              <div className="user-avatar-wrapper">
                <img src={user.avatar} alt={user.name} className="user-avatar" />
                {user.verified && (
                  <div className="verified-badge" title="Verified User">
                    <CheckCircle size={14} />
                  </div>
                )}
              </div>
              <span className={`status-badge ${getStatusClass(user.status)}`}>
                {user.status}
              </span>
            </div>

            <div className="user-card-body">
              <h3 className="user-name">{user.name}</h3>
              <p className="user-id">{user.id}</p>

              <div className="user-info">
                <div className="info-item">
                  <Mail size={14} />
                  <span>{user.email}</span>
                </div>
                <div className="info-item">
                  <Phone size={14} />
                  <span>{user.phone}</span>
                </div>
                <div className="info-item">
                  <MapPin size={14} />
                  <span>{user.location}</span>
                </div>
                <div className="info-item">
                  <Calendar size={14} />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>

              <div className="user-stats">
                <div className="user-stat">
                  <div className="user-stat-value">{user.totalBookings}</div>
                  <div className="user-stat-label">Bookings</div>
                </div>
                <div className="user-stat">
                  <div className="user-stat-value">${user.totalSpent.toLocaleString()}</div>
                  <div className="user-stat-label">Total Spent</div>
                </div>
              </div>

              <div className="user-meta">
                <span className="last-login">Last login: {user.lastLogin}</span>
              </div>
            </div>

            <div className="user-card-footer">
              <button className="action-btn view" title="View Details">
                <Eye size={16} />
                View
              </button>
              <button className="action-btn email" title="Send Email">
                <Mail size={16} />
                Email
              </button>
              <button
                className={`action-btn ${user.status === 'Blocked' ? 'unblock' : 'block'}`}
                title={user.status === 'Blocked' ? 'Unblock User' : 'Block User'}
              >
                <Ban size={16} />
                {user.status === 'Blocked' ? 'Unblock' : 'Block'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-results">
          <p>No users found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
