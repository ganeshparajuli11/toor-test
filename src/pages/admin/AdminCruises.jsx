import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Power,
  Star,
  MapPin,
  DollarSign,
  Ship,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Calendar,
  Anchor,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminCruises.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AdminCruises = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDestination, setFilterDestination] = useState('all');
  const [cruises, setCruises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCruise, setSelectedCruise] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cruiseLine: '',
    shipName: '',
    destination: '',
    departure: '',
    departureDate: '',
    returnDate: '',
    duration: '',
    ports: '',
    pricePerPerson: '',
    capacity: '',
    availableCabins: '',
    amenities: '',
    description: '',
    images: '',
    status: 'active'
  });

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`
    }
  });

  const fetchCruises = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/cruises`, getAuthHeaders());

      if (response.data.success) {
        setCruises(response.data.cruises);
      }
    } catch (error) {
      console.error('Error fetching cruises:', error);
      toast.error('Failed to fetch cruises');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCruises();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      cruiseLine: '',
      shipName: '',
      destination: '',
      departure: '',
      departureDate: '',
      returnDate: '',
      duration: '',
      ports: '',
      pricePerPerson: '',
      capacity: '',
      availableCabins: '',
      amenities: '',
      description: '',
      images: '',
      status: 'active'
    });
  };

  const handleAddCruise = async (e) => {
    e.preventDefault();

    try {
      const cruiseData = {
        ...formData,
        pricePerPerson: parseFloat(formData.pricePerPerson) || 0,
        capacity: parseInt(formData.capacity) || 0,
        availableCabins: parseInt(formData.availableCabins) || 0,
        ports: formData.ports.split(',').map(p => p.trim()).filter(Boolean),
        amenities: formData.amenities.split(',').map(a => a.trim()).filter(Boolean),
        images: formData.images.split(',').map(i => i.trim()).filter(Boolean)
      };

      const response = await axios.post(
        `${API_URL}/api/admin/cruises`,
        cruiseData,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Cruise added successfully');
        setShowAddModal(false);
        resetForm();
        fetchCruises();
      }
    } catch (error) {
      console.error('Error adding cruise:', error);
      toast.error('Failed to add cruise');
    }
  };

  const handleEditCruise = async (e) => {
    e.preventDefault();

    if (!selectedCruise) return;

    try {
      const cruiseData = {
        ...formData,
        pricePerPerson: parseFloat(formData.pricePerPerson) || 0,
        capacity: parseInt(formData.capacity) || 0,
        availableCabins: parseInt(formData.availableCabins) || 0,
        ports: typeof formData.ports === 'string'
          ? formData.ports.split(',').map(p => p.trim()).filter(Boolean)
          : formData.ports,
        amenities: typeof formData.amenities === 'string'
          ? formData.amenities.split(',').map(a => a.trim()).filter(Boolean)
          : formData.amenities,
        images: typeof formData.images === 'string'
          ? formData.images.split(',').map(i => i.trim()).filter(Boolean)
          : formData.images
      };

      const response = await axios.put(
        `${API_URL}/api/admin/cruises/${selectedCruise.id}`,
        cruiseData,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Cruise updated successfully');
        setShowEditModal(false);
        setSelectedCruise(null);
        resetForm();
        fetchCruises();
      }
    } catch (error) {
      console.error('Error updating cruise:', error);
      toast.error('Failed to update cruise');
    }
  };

  const handleDeleteCruise = async (cruiseId) => {
    if (!window.confirm('Are you sure you want to delete this cruise? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/api/admin/cruises/${cruiseId}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Cruise deleted successfully');
        fetchCruises();
      }
    } catch (error) {
      console.error('Error deleting cruise:', error);
      toast.error('Failed to delete cruise');
    }
  };

  const handleToggleStatus = async (cruise) => {
    const newStatus = cruise.status === 'active' ? 'inactive' : 'active';

    try {
      const response = await axios.put(
        `${API_URL}/api/admin/cruises/${cruise.id}`,
        { status: newStatus },
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success(`Cruise ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        fetchCruises();
      }
    } catch (error) {
      console.error('Error updating cruise status:', error);
      toast.error('Failed to update cruise status');
    }
  };

  const openEditModal = (cruise) => {
    setSelectedCruise(cruise);
    setFormData({
      name: cruise.name || '',
      cruiseLine: cruise.cruiseLine || '',
      shipName: cruise.shipName || '',
      destination: cruise.destination || '',
      departure: cruise.departure || '',
      departureDate: cruise.departureDate ? cruise.departureDate.split('T')[0] : '',
      returnDate: cruise.returnDate ? cruise.returnDate.split('T')[0] : '',
      duration: cruise.duration || '',
      ports: Array.isArray(cruise.ports) ? cruise.ports.join(', ') : '',
      pricePerPerson: cruise.pricePerPerson || '',
      capacity: cruise.capacity || '',
      availableCabins: cruise.availableCabins || '',
      amenities: Array.isArray(cruise.amenities) ? cruise.amenities.join(', ') : '',
      description: cruise.description || '',
      images: Array.isArray(cruise.images) ? cruise.images.join(', ') : '',
      status: cruise.status || 'active'
    });
    setShowEditModal(true);
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-available';
      case 'inactive':
        return 'status-cancelled';
      case 'sold_out':
        return 'status-soldout';
      default:
        return 'status-available';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Available';
      case 'inactive':
        return 'Unavailable';
      case 'sold_out':
        return 'Sold Out';
      default:
        return status || 'Available';
    }
  };

  const filteredCruises = cruises.filter((cruise) => {
    const matchesSearch =
      (cruise.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cruise.cruiseLine || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cruise.destination || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cruise.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || cruise.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesDestination = filterDestination === 'all' ||
      (cruise.destination || '').toLowerCase().includes(filterDestination.toLowerCase());

    return matchesSearch && matchesStatus && matchesDestination;
  });

  const totalCruises = cruises.length;
  const availableCruises = cruises.filter(c => c.status === 'active').length;
  const soldOutCruises = cruises.filter(c => c.status === 'sold_out').length;
  const totalRevenue = cruises.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);
  const totalBookings = cruises.reduce((sum, c) => sum + (c.totalBookings || 0), 0);

  if (loading) {
    return (
      <div className="admin-cruises">
        <div className="loading-state">
          <RefreshCw size={40} className="spinning" />
          <p>Loading cruises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-cruises">
      <div className="cruises-header">
        <div>
          <h1 className="cruises-title">Cruises Management</h1>
          <p className="cruises-subtitle">Manage cruise bookings and availability</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchCruises}>
            <RefreshCw size={20} />
          </button>
          <button className="add-cruise-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            Add Cruise
          </button>
          <button className="export-btn">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="cruises-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by cruise name, line, or destination..."
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
              <option value="active">Available</option>
              <option value="sold_out">Sold Out</option>
              <option value="inactive">Unavailable</option>
            </select>
          </div>

          <div className="filter-group">
            <MapPin size={18} />
            <select
              value={filterDestination}
              onChange={(e) => setFilterDestination(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Destinations</option>
              <option value="Caribbean">Caribbean</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Alaska">Alaska</option>
              <option value="Asia">Asia</option>
              <option value="Pacific">Pacific</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="cruises-stats">
        <div className="stat-item">
          <div className="stat-icon total">
            <Ship size={20} />
          </div>
          <div>
            <div className="stat-value">{totalCruises}</div>
            <div className="stat-label">Total Cruises</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon available">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{availableCruises}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon soldout">
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{soldOutCruises}</div>
            <div className="stat-label">Sold Out</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon passengers">
            <Users size={20} />
          </div>
          <div>
            <div className="stat-value">{totalBookings.toLocaleString()}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon revenue">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="stat-value">${totalRevenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Cruises Grid */}
      {cruises.length === 0 ? (
        <div className="no-results">
          <Ship size={48} />
          <p>No cruises added yet</p>
          <span>Click "Add Cruise" to add your first cruise</span>
        </div>
      ) : (
        <div className="cruises-grid">
          {filteredCruises.map((cruise) => (
            <div key={cruise.id} className="cruise-card">
              <div className="cruise-card-image-wrapper">
                {cruise.images && cruise.images.length > 0 ? (
                  <img src={cruise.images[0]} alt={cruise.name} className="cruise-card-image" />
                ) : (
                  <div className="cruise-card-image-placeholder">
                    <Ship size={48} />
                  </div>
                )}
                <span className={`status-badge ${getStatusClass(cruise.status)}`}>
                  {getStatusDisplay(cruise.status)}
                </span>
              </div>

              <div className="cruise-card-body">
                <h3 className="cruise-name">{cruise.name}</h3>
                <p className="cruise-line">
                  <Ship size={14} />
                  {cruise.cruiseLine} {cruise.shipName && `• ${cruise.shipName}`}
                </p>

                <div className="cruise-destination">
                  <MapPin size={14} />
                  <span>{cruise.destination}</span>
                </div>

                <div className="cruise-details">
                  <div className="detail-item">
                    <Calendar size={14} />
                    <div>
                      <div className="detail-label">Duration</div>
                      <div className="detail-value">{cruise.duration || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="detail-item">
                    <Anchor size={14} />
                    <div>
                      <div className="detail-label">Departure</div>
                      <div className="detail-value">{cruise.departure || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {cruise.ports && cruise.ports.length > 0 && (
                  <div className="cruise-ports">
                    <div className="ports-label">Ports of Call:</div>
                    <div className="ports-list">
                      {cruise.ports.slice(0, 3).map((port, index) => (
                        <span key={index} className="port-tag">
                          {port}
                        </span>
                      ))}
                      {cruise.ports.length > 3 && (
                        <span className="port-tag more">+{cruise.ports.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {cruise.capacity > 0 && (
                  <div className="cruise-capacity">
                    <div className="capacity-bar-container">
                      <div className="capacity-bar-label">
                        <Users size={14} />
                        <span>Capacity: {cruise.availableCabins || 0} / {cruise.capacity}</span>
                      </div>
                      <div className="capacity-bar">
                        <div
                          className="capacity-bar-fill"
                          style={{ width: `${((cruise.capacity - (cruise.availableCabins || 0)) / cruise.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="cruise-info-grid">
                  <div className="info-item">
                    <Calendar size={16} />
                    <div>
                      <div className="info-value">
                        {cruise.departureDate
                          ? new Date(cruise.departureDate).toLocaleDateString()
                          : 'TBD'}
                      </div>
                      <div className="info-label">Departure Date</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <Users size={16} />
                    <div>
                      <div className="info-value">{cruise.totalBookings || 0}</div>
                      <div className="info-label">Total Bookings</div>
                    </div>
                  </div>
                </div>

                <div className="cruise-price">
                  <div>
                    <span className="price-label">From</span>
                    <span className="price-value">
                      ${(cruise.pricePerPerson || 0).toLocaleString()}
                    </span>
                    <span className="price-unit">/person</span>
                  </div>
                </div>

                {cruise.amenities && cruise.amenities.length > 0 && (
                  <div className="cruise-amenities">
                    {cruise.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="amenity-tag">
                        {amenity}
                      </span>
                    ))}
                    {cruise.amenities.length > 3 && (
                      <span className="amenity-tag more">+{cruise.amenities.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="cruise-revenue">
                  <DollarSign size={14} />
                  <span>Revenue: ${(cruise.totalRevenue || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="cruise-card-footer">
                <button className="action-btn view" title="View Details">
                  <Eye size={16} />
                </button>
                <button
                  className="action-btn edit"
                  title="Edit Cruise"
                  onClick={() => openEditModal(cruise)}
                >
                  <Edit size={16} />
                </button>
                <button
                  className={`action-btn ${cruise.status === 'active' ? 'deactivate' : 'activate'}`}
                  title={cruise.status === 'active' ? 'Mark Unavailable' : 'Mark Available'}
                  onClick={() => handleToggleStatus(cruise)}
                >
                  <Power size={16} />
                </button>
                <button
                  className="action-btn delete"
                  title="Delete Cruise"
                  onClick={() => handleDeleteCruise(cruise.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cruises.length > 0 && filteredCruises.length === 0 && (
        <div className="no-results">
          <p>No cruises found matching your criteria</p>
        </div>
      )}

      {/* Add Cruise Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Cruise</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddCruise} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Cruise Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Caribbean Paradise"
                  />
                </div>
                <div className="form-group">
                  <label>Cruise Line *</label>
                  <input
                    type="text"
                    name="cruiseLine"
                    value={formData.cruiseLine}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Royal Caribbean"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ship Name</label>
                  <input
                    type="text"
                    name="shipName"
                    value={formData.shipName}
                    onChange={handleInputChange}
                    placeholder="e.g., Harmony of the Seas"
                  />
                </div>
                <div className="form-group">
                  <label>Destination *</label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Caribbean Islands"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Departure Port *</label>
                  <input
                    type="text"
                    name="departure"
                    value={formData.departure}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Miami, FL"
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 7 nights"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Departure Date</label>
                  <input
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Return Date</label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ports of Call (comma-separated)</label>
                <input
                  type="text"
                  name="ports"
                  value={formData.ports}
                  onChange={handleInputChange}
                  placeholder="e.g., Jamaica, Cozumel, Bahamas"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price Per Person ($) *</label>
                  <input
                    type="number"
                    name="pricePerPerson"
                    value={formData.pricePerPerson}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Total Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Available Cabins</label>
                  <input
                    type="number"
                    name="availableCabins"
                    value={formData.availableCabins}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Amenities (comma-separated)</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleInputChange}
                  placeholder="e.g., Pool, Casino, Spa, Theater"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter cruise description..."
                />
              </div>

              <div className="form-group">
                <label>Image URLs (comma-separated)</label>
                <input
                  type="text"
                  name="images"
                  value={formData.images}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="active">Available</option>
                  <option value="inactive">Unavailable</option>
                  <option value="sold_out">Sold Out</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Cruise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Cruise Modal */}
      {showEditModal && selectedCruise && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Cruise</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditCruise} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Cruise Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cruise Line *</label>
                  <input
                    type="text"
                    name="cruiseLine"
                    value={formData.cruiseLine}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ship Name</label>
                  <input
                    type="text"
                    name="shipName"
                    value={formData.shipName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Destination *</label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Departure Port *</label>
                  <input
                    type="text"
                    name="departure"
                    value={formData.departure}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Departure Date</label>
                  <input
                    type="date"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Return Date</label>
                  <input
                    type="date"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ports of Call (comma-separated)</label>
                <input
                  type="text"
                  name="ports"
                  value={formData.ports}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price Per Person ($) *</label>
                  <input
                    type="number"
                    name="pricePerPerson"
                    value={formData.pricePerPerson}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Total Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Available Cabins</label>
                  <input
                    type="number"
                    name="availableCabins"
                    value={formData.availableCabins}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Amenities (comma-separated)</label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Image URLs (comma-separated)</label>
                <input
                  type="text"
                  name="images"
                  value={formData.images}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="active">Available</option>
                  <option value="inactive">Unavailable</option>
                  <option value="sold_out">Sold Out</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Update Cruise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCruises;
