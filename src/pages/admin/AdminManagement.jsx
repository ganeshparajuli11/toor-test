import { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  Shield,
  ShieldCheck,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Search,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminManagement.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'admin'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
    // Get current admin info
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      setCurrentAdmin(JSON.parse(adminUser));
    }
  }, []);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`
    }
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/admins`, getAuthHeaders());
      if (response.data.success) {
        setAdmins(response.data.admins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      if (error.response?.status === 403) {
        toast.error('You need super admin privileges to view this page');
      } else {
        toast.error('Failed to fetch admins');
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain an uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Password must contain a lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain a number';
    }

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/admins`,
        formData,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Admin created successfully!');
        setShowAddModal(false);
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'admin'
        });
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        setFormErrors(fieldErrors);
        toast.error('Please check the form for errors');
      } else {
        toast.error('Failed to create admin');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    if (admin.id === currentAdmin?.id) {
      toast.error('You cannot change your own status');
      return;
    }

    const action = admin.isActive ? 'deactivate' : 'activate';
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/admins/${admin.id}/${action}`,
        {},
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success(`Admin ${action}d successfully`);
        fetchAdmins();
      }
    } catch (error) {
      console.error(`Error ${action}ing admin:`, error);
      toast.error(error.response?.data?.error || `Failed to ${action} admin`);
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (admin.id === currentAdmin?.id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${admin.firstName} ${admin.lastName}?`)) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/api/admin/admins/${admin.id}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Admin deleted successfully');
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error(error.response?.data?.error || 'Failed to delete admin');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const filteredAdmins = admins.filter(admin => {
    const query = searchQuery.toLowerCase();
    return (
      admin.email.toLowerCase().includes(query) ||
      admin.firstName.toLowerCase().includes(query) ||
      admin.lastName.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Check if current user is super_admin
  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  if (!isSuperAdmin) {
    return (
      <div className="admin-management-page">
        <div className="access-denied">
          <Shield size={64} />
          <h2>Access Denied</h2>
          <p>You need super admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-management-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1><Users size={28} /> Admin Management</h1>
          <p>Manage admin users and their access levels</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchAdmins} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          </button>
          <button className="add-admin-btn" onClick={() => setShowAddModal(true)}>
            <UserPlus size={18} />
            Add Admin
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search admins by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Admin List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading admins...</p>
        </div>
      ) : (
        <div className="admins-grid">
          {filteredAdmins.length === 0 ? (
            <div className="empty-state">
              <Users size={48} />
              <p>No admins found</p>
            </div>
          ) : (
            filteredAdmins.map(admin => (
              <div key={admin.id} className={`admin-card ${!admin.isActive ? 'inactive' : ''}`}>
                <div className="admin-card-header">
                  <div className="admin-avatar">
                    {admin.firstName[0]}{admin.lastName[0]}
                  </div>
                  <div className="admin-info">
                    <h3>{admin.firstName} {admin.lastName}</h3>
                    <p className="admin-email">{admin.email}</p>
                  </div>
                  <span className={`role-badge ${admin.role}`}>
                    {admin.role === 'super_admin' ? (
                      <><ShieldCheck size={14} /> Super Admin</>
                    ) : (
                      <><Shield size={14} /> Admin</>
                    )}
                  </span>
                </div>

                <div className="admin-card-body">
                  <div className="admin-meta">
                    <div className="meta-item">
                      <span className="meta-label">Status</span>
                      <span className={`status-badge ${admin.isActive ? 'active' : 'inactive'}`}>
                        {admin.isActive ? (
                          <><CheckCircle size={14} /> Active</>
                        ) : (
                          <><AlertCircle size={14} /> Inactive</>
                        )}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Last Login</span>
                      <span className="meta-value">{formatDate(admin.lastLogin)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Created</span>
                      <span className="meta-value">{formatDate(admin.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {admin.id !== currentAdmin?.id && (
                  <div className="admin-card-actions">
                    <button
                      className={`action-btn ${admin.isActive ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleStatus(admin)}
                      title={admin.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {admin.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                      {admin.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteAdmin(admin)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}

                {admin.id === currentAdmin?.id && (
                  <div className="current-admin-badge">
                    <span>This is you</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><UserPlus size={24} /> Add New Admin</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    className={formErrors.firstName ? 'error' : ''}
                  />
                  {formErrors.firstName && (
                    <span className="error-text">{formErrors.firstName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    className={formErrors.lastName ? 'error' : ''}
                  />
                  {formErrors.lastName && (
                    <span className="error-text">{formErrors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && (
                  <span className="error-text">{formErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className={formErrors.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formErrors.password && (
                  <span className="error-text">{formErrors.password}</span>
                )}
                <span className="helper-text">
                  Min 8 characters, uppercase, lowercase, and number required
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <span className="helper-text">
                  Super admins can manage other admin accounts
                </span>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="btn-spinner"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
