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
  Bed,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Loader,
  RefreshCw,
  Trash2,
  X,
  Globe,
  Import
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import ratehawkService from '../../services/ratehawk.service';
import './AdminHotels.css';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

const AdminHotels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    description: '',
    rating: 0,
    stars: 3,
    pricePerNight: 0,
    rooms: 0,
    availableRooms: 0,
    amenities: [],
    status: 'active'
  });

  // RateHawk search state
  const [showRateHawkSearch, setShowRateHawkSearch] = useState(false);
  const [rateHawkQuery, setRateHawkQuery] = useState('');
  const [rateHawkResults, setRateHawkResults] = useState([]);
  const [rateHawkLoading, setRateHawkLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('managed'); // 'managed' or 'ratehawk'

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`
    }
  });

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/hotels`, getAuthHeaders());

      if (response.data.success) {
        setHotels(response.data.hotels);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('Failed to fetch hotels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/hotels`,
        formData,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Hotel created successfully');
        setShowAddModal(false);
        resetForm();
        fetchHotels();
      }
    } catch (error) {
      console.error('Error creating hotel:', error);
      toast.error('Failed to create hotel');
    }
  };

  const handleUpdateHotel = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/hotels/${editingHotel.id}`,
        formData,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Hotel updated successfully');
        setEditingHotel(null);
        resetForm();
        fetchHotels();
      }
    } catch (error) {
      console.error('Error updating hotel:', error);
      toast.error('Failed to update hotel');
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/api/admin/hotels/${hotelId}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Hotel deleted successfully');
        fetchHotels();
      }
    } catch (error) {
      console.error('Error deleting hotel:', error);
      toast.error('Failed to delete hotel');
    }
  };

  const handleToggleStatus = async (hotel) => {
    const newStatus = hotel.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/hotels/${hotel.id}`,
        { status: newStatus },
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success(`Hotel ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        fetchHotels();
      }
    } catch (error) {
      console.error('Error updating hotel status:', error);
      toast.error('Failed to update hotel status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      address: '',
      description: '',
      rating: 0,
      stars: 3,
      pricePerNight: 0,
      rooms: 0,
      availableRooms: 0,
      amenities: [],
      status: 'active'
    });
  };

  // RateHawk API search
  const searchRateHawkHotels = async () => {
    if (!rateHawkQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setRateHawkLoading(true);
    try {
      console.log('[AdminHotels] Searching RateHawk for:', rateHawkQuery);
      const results = await ratehawkService.getSuggestedHotels(rateHawkQuery);

      if (results && results.length > 0) {
        setRateHawkResults(results);
        toast.success(`Found ${results.length} hotels from RateHawk`);
      } else {
        setRateHawkResults([]);
        toast.info('No hotels found. Try a different search term.');
      }
    } catch (error) {
      console.error('[AdminHotels] RateHawk search error:', error);
      toast.error('Failed to search RateHawk API. Check API settings.');
      setRateHawkResults([]);
    } finally {
      setRateHawkLoading(false);
    }
  };

  // Import hotel from RateHawk to managed hotels
  const importFromRateHawk = async (rateHawkHotel) => {
    try {
      const hotelData = {
        name: rateHawkHotel.name,
        location: rateHawkHotel.location || '',
        address: rateHawkHotel.address || '',
        description: rateHawkHotel.description || '',
        rating: rateHawkHotel.rating || 0,
        stars: rateHawkHotel.stars || 3,
        pricePerNight: rateHawkHotel.price || 0,
        rooms: 100,
        availableRooms: 100,
        amenities: rateHawkHotel.amenities || [],
        images: rateHawkHotel.images || [],
        status: 'active',
        source: 'ratehawk',
        sourceId: rateHawkHotel.id
      };

      const response = await axios.post(
        `${API_URL}/api/admin/hotels`,
        hotelData,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success(`Imported "${rateHawkHotel.name}" successfully`);
        fetchHotels();
        setActiveTab('managed');
      }
    } catch (error) {
      console.error('Error importing hotel:', error);
      toast.error('Failed to import hotel');
    }
  };

  const openEditModal = (hotel) => {
    setFormData({
      name: hotel.name || '',
      location: hotel.location || '',
      address: hotel.address || '',
      description: hotel.description || '',
      rating: hotel.rating || 0,
      stars: hotel.stars || 3,
      pricePerNight: hotel.pricePerNight || 0,
      rooms: hotel.rooms || 0,
      availableRooms: hotel.availableRooms || 0,
      amenities: hotel.amenities || [],
      status: hotel.status || 'active'
    });
    setEditingHotel(hotel);
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      default:
        return 'status-active';
    }
  };

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      (hotel.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hotel.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hotel.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || (hotel.status || 'active').toLowerCase() === filterStatus;
    const matchesLocation = filterLocation === 'all' || (hotel.location || '').includes(filterLocation);

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const locations = [...new Set(hotels.map(h => h.location).filter(Boolean))];

  const totalHotels = hotels.length;
  const activeHotels = hotels.filter(h => (h.status || 'active') === 'active').length;
  const totalRooms = hotels.reduce((sum, h) => sum + (h.rooms || 0), 0);
  const availableRooms = hotels.reduce((sum, h) => sum + (h.availableRooms || 0), 0);
  const totalRevenue = hotels.reduce((sum, h) => sum + (h.totalRevenue || 0), 0);

  if (loading) {
    return (
      <div className="admin-hotels">
        <div className="loading-state">
          <RefreshCw size={40} className="spinning" />
          <p>Loading hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-hotels">
      <div className="hotels-header">
        <div>
          <h1 className="hotels-title">Hotels Management</h1>
          <p className="hotels-subtitle">Manage hotel listings and search RateHawk API</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchHotels}>
            <RefreshCw size={20} />
          </button>
          <button className="add-hotel-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            Add Hotel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="hotels-tabs">
        <button
          className={`tab-btn ${activeTab === 'managed' ? 'active' : ''}`}
          onClick={() => setActiveTab('managed')}
        >
          <Bed size={18} />
          Managed Hotels ({hotels.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'ratehawk' ? 'active' : ''}`}
          onClick={() => setActiveTab('ratehawk')}
        >
          <Globe size={18} />
          Search RateHawk API
        </button>
      </div>

      {/* RateHawk Tab Content */}
      {activeTab === 'ratehawk' && (
        <div className="ratehawk-section">
          <div className="ratehawk-search-box">
            <div className="search-input-group">
              <Globe size={20} />
              <input
                type="text"
                placeholder="Search for hotels (e.g., 'Paris hotels', 'Hilton New York')..."
                value={rateHawkQuery}
                onChange={(e) => setRateHawkQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchRateHawkHotels()}
                className="search-input"
              />
              <button
                className="search-btn"
                onClick={searchRateHawkHotels}
                disabled={rateHawkLoading}
              >
                {rateHawkLoading ? <Loader size={18} className="spinning" /> : <Search size={18} />}
                {rateHawkLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <p className="search-hint">
              Search RateHawk API for real hotel data. You can import hotels to your managed list.
            </p>
          </div>

          {/* RateHawk Results */}
          {rateHawkLoading ? (
            <div className="loading-state">
              <RefreshCw size={40} className="spinning" />
              <p>Searching RateHawk API...</p>
            </div>
          ) : rateHawkResults.length > 0 ? (
            <div className="hotels-grid">
              {rateHawkResults.map((hotel, index) => (
                <div key={hotel.id || index} className="hotel-card ratehawk-card">
                  <div className="hotel-card-image-wrapper">
                    {hotel.images && hotel.images[0] ? (
                      <img
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className="hotel-card-image"
                      />
                    ) : (
                      <div className="hotel-card-image-placeholder">
                        <Bed size={48} />
                      </div>
                    )}
                    <span className="source-badge">
                      <Globe size={12} /> RateHawk
                    </span>
                    {hotel.rating && (
                      <div className="hotel-rating">
                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                        <span>{hotel.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="hotel-card-body">
                    <h3 className="hotel-name">{hotel.name}</h3>
                    <div className="hotel-location">
                      <MapPin size={14} />
                      <span>{hotel.location || 'Location not specified'}</span>
                    </div>

                    {hotel.description && (
                      <p className="hotel-description">{hotel.description.slice(0, 100)}...</p>
                    )}

                    {hotel.price > 0 && (
                      <div className="hotel-price">
                        <span className="price-label">From</span>
                        <span className="price-value">${hotel.price}</span>
                        <span className="price-period">/night</span>
                      </div>
                    )}

                    {hotel.amenities && hotel.amenities.length > 0 && (
                      <div className="hotel-amenities">
                        {hotel.amenities.slice(0, 3).map((amenity, i) => (
                          <span key={i} className="amenity-tag">{amenity}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="hotel-card-footer">
                    <button
                      className="action-btn import"
                      title="Import to Managed Hotels"
                      onClick={() => importFromRateHawk(hotel)}
                    >
                      <Import size={16} />
                      Import
                    </button>
                    <button className="action-btn view" title="View Details">
                      <Eye size={16} />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : rateHawkQuery && !rateHawkLoading ? (
            <div className="no-results">
              <AlertCircle size={48} />
              <p>No hotels found</p>
              <span>Try a different search term</span>
            </div>
          ) : (
            <div className="no-results">
              <Globe size={48} />
              <p>Search RateHawk API</p>
              <span>Enter a destination or hotel name to find real hotels</span>
            </div>
          )}
        </div>
      )}

      {/* Managed Hotels Tab Content */}
      {activeTab === 'managed' && (
        <>
          {/* Filters and Search */}
          <div className="hotels-controls">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search by hotel name, location, or ID..."
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
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="filter-group">
                <MapPin size={18} />
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

      {/* Stats Summary */}
      <div className="hotels-stats">
        <div className="stat-item">
          <div className="stat-icon total">
            <Bed size={20} />
          </div>
          <div>
            <div className="stat-value">{totalHotels}</div>
            <div className="stat-label">Total Hotels</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon active">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{activeHotels}</div>
            <div className="stat-label">Active Hotels</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon rooms">
            <Bed size={20} />
          </div>
          <div>
            <div className="stat-value">{availableRooms}/{totalRooms}</div>
            <div className="stat-label">Available Rooms</div>
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

      {/* Empty State */}
      {hotels.length === 0 ? (
        <div className="no-results">
          <AlertCircle size={48} />
          <p>No hotels added yet</p>
          <span>Click "Add Hotel" to create your first hotel listing</span>
          <button className="add-hotel-btn" onClick={() => setShowAddModal(true)} style={{ marginTop: '1rem' }}>
            <Plus size={20} />
            Add Hotel
          </button>
        </div>
      ) : (
        /* Hotels Grid */
        <div className="hotels-grid">
          {filteredHotels.map((hotel) => (
            <div key={hotel.id} className="hotel-card">
              <div className="hotel-card-image-wrapper">
                {hotel.images && hotel.images[0] ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="hotel-card-image"
                  />
                ) : (
                  <div className="hotel-card-image-placeholder">
                    <Bed size={48} />
                  </div>
                )}
                <span className={`status-badge ${getStatusClass(hotel.status)}`}>
                  {hotel.status || 'Active'}
                </span>
                <div className="hotel-rating">
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  <span>{hotel.rating || 0}</span>
                </div>
              </div>

              <div className="hotel-card-body">
                <h3 className="hotel-name">{hotel.name}</h3>
                <p className="hotel-id">{hotel.id.slice(0, 8)}...</p>

                <div className="hotel-location">
                  <MapPin size={14} />
                  <span>{hotel.location}</span>
                </div>

                <div className="hotel-info-grid">
                  <div className="info-item">
                    <Bed size={16} />
                    <div>
                      <div className="info-value">{hotel.rooms || 0}</div>
                      <div className="info-label">Total Rooms</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <CheckCircle size={16} />
                    <div>
                      <div className="info-value">{hotel.availableRooms || 0}</div>
                      <div className="info-label">Available</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <Users size={16} />
                    <div>
                      <div className="info-value">{hotel.totalBookings || 0}</div>
                      <div className="info-label">Bookings</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <DollarSign size={16} />
                    <div>
                      <div className="info-value">${(hotel.totalRevenue || 0).toLocaleString()}</div>
                      <div className="info-label">Revenue</div>
                    </div>
                  </div>
                </div>

                <div className="hotel-price">
                  <span className="price-label">Price per night</span>
                  <span className="price-value">${hotel.pricePerNight || 0}</span>
                </div>

                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="hotel-amenities">
                    {hotel.amenities.slice(0, 3).map((amenity, index) => (
                      <span key={index} className="amenity-tag">
                        {amenity}
                      </span>
                    ))}
                    {hotel.amenities.length > 3 && (
                      <span className="amenity-tag more">+{hotel.amenities.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              <div className="hotel-card-footer">
                <button className="action-btn view" title="View Details">
                  <Eye size={16} />
                </button>
                <button className="action-btn edit" title="Edit Hotel" onClick={() => openEditModal(hotel)}>
                  <Edit size={16} />
                </button>
                <button
                  className={`action-btn ${(hotel.status || 'active') === 'active' ? 'deactivate' : 'activate'}`}
                  title={(hotel.status || 'active') === 'active' ? 'Deactivate' : 'Activate'}
                  onClick={() => handleToggleStatus(hotel)}
                >
                  <Power size={16} />
                </button>
                <button
                  className="action-btn delete"
                  title="Delete Hotel"
                  onClick={() => handleDeleteHotel(hotel.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {hotels.length > 0 && filteredHotels.length === 0 && (
        <div className="no-results">
          <p>No hotels found matching your criteria</p>
        </div>
      )}
        </>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingHotel) && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setEditingHotel(null); resetForm(); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h2>
              <button className="close-btn" onClick={() => { setShowAddModal(false); setEditingHotel(null); resetForm(); }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={editingHotel ? handleUpdateHotel : handleCreateHotel} className="hotel-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Hotel Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter hotel name"
                  />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Hotel description"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price per Night ($)</label>
                  <input
                    type="number"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Star Rating</label>
                  <select
                    value={formData.stars}
                    onChange={(e) => setFormData({ ...formData, stars: Number(e.target.value) })}
                  >
                    <option value={1}>1 Star</option>
                    <option value={2}>2 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={5}>5 Stars</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Total Rooms</label>
                  <input
                    type="number"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: Number(e.target.value) })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Available Rooms</label>
                  <input
                    type="number"
                    value={formData.availableRooms}
                    onChange={(e) => setFormData({ ...formData, availableRooms: Number(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => { setShowAddModal(false); setEditingHotel(null); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingHotel ? 'Update Hotel' : 'Create Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHotels;
