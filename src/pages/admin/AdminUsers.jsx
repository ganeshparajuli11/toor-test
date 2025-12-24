import { useState, useEffect } from 'react';
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
  UserX,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminUsers.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
    newThisMonth: 0,
    activeThisMonth: 0
  });
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`
    }
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/users`, getAuthHeaders());

      if (response.data.success) {
        setUsers(response.data.users);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/users/${userId}/status`,
        { status: newStatus },
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success(`User ${newStatus === 'blocked' ? 'blocked' : 'activated'} successfully`);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/api/admin/users/${userId}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'blocked':
        return 'status-blocked';
      case 'inactive':
        return 'status-inactive';
      default:
        return 'status-active';
    }
  };

  const getUserStatus = (user) => {
    if (user.status) return user.status;
    return user.isVerified ? 'Active' : 'Inactive';
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const userStatus = getUserStatus(user).toLowerCase();
    const matchesStatus = filterStatus === 'all' || userStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => getUserStatus(u).toLowerCase() === 'active').length;
  const blockedUsers = users.filter(u => getUserStatus(u).toLowerCase() === 'blocked').length;
  const verifiedUsers = users.filter(u => u.isVerified).length;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="admin-users">
        <div className="loading-state">
          <RefreshCw size={40} className="spinning" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <div>
          <h1 className="users-title">Users Management</h1>
          <p className="users-subtitle">Manage and monitor all registered users</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchUsers}>
            <RefreshCw size={20} />
          </button>
          <button className="export-btn">
            <Download size={20} />
            Export Users
          </button>
        </div>
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
      {users.length === 0 ? (
        <div className="no-results">
          <AlertCircle size={48} />
          <p>No registered users yet</p>
          <span>Users will appear here when they sign up</span>
        </div>
      ) : (
        <div className="users-grid">
          {filteredUsers.map((user) => (
            <div key={user.id} className="user-card">
              <div className="user-card-header">
                <div className="user-avatar-wrapper">
                  {user.avatar ? (
                    <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="user-avatar" />
                  ) : (
                    <div className="user-avatar-initials">
                      {getInitials(user.firstName, user.lastName)}
                    </div>
                  )}
                  {user.isVerified && (
                    <div className="verified-badge" title="Verified User">
                      <CheckCircle size={14} />
                    </div>
                  )}
                </div>
                <span className={`status-badge ${getStatusClass(getUserStatus(user))}`}>
                  {getUserStatus(user)}
                </span>
              </div>

              <div className="user-card-body">
                <h3 className="user-name">{user.firstName} {user.lastName}</h3>
                <p className="user-id">{user.id.slice(0, 8)}...</p>

                <div className="user-info">
                  <div className="info-item">
                    <Mail size={14} />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="info-item">
                      <Phone size={14} />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="info-item">
                      <MapPin size={14} />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <Calendar size={14} />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <div className="user-stats">
                  <div className="user-stat">
                    <div className="user-stat-value">{user.bookings?.length || 0}</div>
                    <div className="user-stat-label">Bookings</div>
                  </div>
                  <div className="user-stat">
                    <div className="user-stat-value">
                      {user.isVerified ? 'Yes' : 'No'}
                    </div>
                    <div className="user-stat-label">Verified</div>
                  </div>
                </div>

                <div className="user-meta">
                  <span className="last-login">
                    Last login: {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                  </span>
                </div>
              </div>

              <div className="user-card-footer">
                <button className="action-btn view" title="View Details">
                  <Eye size={16} />
                  View
                </button>
                <button
                  className={`action-btn ${getUserStatus(user).toLowerCase() === 'blocked' ? 'unblock' : 'block'}`}
                  title={getUserStatus(user).toLowerCase() === 'blocked' ? 'Unblock User' : 'Block User'}
                  onClick={() => handleStatusChange(
                    user.id,
                    getUserStatus(user).toLowerCase() === 'blocked' ? 'active' : 'blocked'
                  )}
                >
                  <Ban size={16} />
                  {getUserStatus(user).toLowerCase() === 'blocked' ? 'Unblock' : 'Block'}
                </button>
                <button
                  className="action-btn delete"
                  title="Delete User"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {users.length > 0 && filteredUsers.length === 0 && (
        <div className="no-results">
          <p>No users found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
