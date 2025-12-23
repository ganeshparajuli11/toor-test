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
  Car,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Fuel,
  Settings,
  RefreshCw,
  Trash2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import './AdminCars.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AdminCars = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: 'sedan',
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    doors: 4,
    luggage: 2,
    location: '',
    pricePerDay: 0,
    features: [],
    status: 'active'
  });

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('adminToken')}`
    }
  });

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/admin/cars`, getAuthHeaders());

      if (response.data.success) {
        setCars(response.data.cars);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleCreateCar = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/cars`,
        formData,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Car created successfully');
        setShowAddModal(false);
        resetForm();
        fetchCars();
      }
    } catch (error) {
      console.error('Error creating car:', error);
      toast.error('Failed to create car');
    }
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/cars/${editingCar.id}`,
        formData,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Car updated successfully');
        setEditingCar(null);
        resetForm();
        fetchCars();
      }
    } catch (error) {
      console.error('Error updating car:', error);
      toast.error('Failed to update car');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_URL}/api/admin/cars/${carId}`,
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success('Car deleted successfully');
        fetchCars();
      }
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Failed to delete car');
    }
  };

  const handleToggleStatus = async (car) => {
    const newStatus = car.status === 'active' ? 'inactive' : 'active';
    try {
      const response = await axios.put(
        `${API_URL}/api/admin/cars/${car.id}`,
        { status: newStatus },
        getAuthHeaders()
      );

      if (response.data.success) {
        toast.success(`Car ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        fetchCars();
      }
    } catch (error) {
      console.error('Error updating car status:', error);
      toast.error('Failed to update car status');
    }
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      type: 'sedan',
      transmission: 'automatic',
      fuelType: 'petrol',
      seats: 5,
      doors: 4,
      luggage: 2,
      location: '',
      pricePerDay: 0,
      features: [],
      status: 'active'
    });
  };

  const openEditModal = (car) => {
    setFormData({
      make: car.make || '',
      model: car.model || '',
      year: car.year || new Date().getFullYear(),
      type: car.type || 'sedan',
      transmission: car.transmission || 'automatic',
      fuelType: car.fuelType || 'petrol',
      seats: car.seats || 5,
      doors: car.doors || 4,
      luggage: car.luggage || 2,
      location: car.location || '',
      pricePerDay: car.pricePerDay || 0,
      features: car.features || [],
      status: car.status || 'active'
    });
    setEditingCar(car);
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

  const filteredCars = cars.filter((car) => {
    const carName = `${car.make || ''} ${car.model || ''}`.toLowerCase();
    const matchesSearch =
      carName.includes(searchTerm.toLowerCase()) ||
      (car.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (car.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || (car.status || 'active').toLowerCase() === filterStatus;
    const matchesType = filterType === 'all' || (car.type || '').toLowerCase() === filterType.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const carTypes = [...new Set(cars.map(c => c.type).filter(Boolean))];

  const totalCars = cars.length;
  const availableCars = cars.filter(c => (c.status || 'active') === 'active' && c.available !== false).length;
  const totalRentals = cars.reduce((sum, c) => sum + (c.totalRentals || 0), 0);
  const totalRevenue = cars.reduce((sum, c) => sum + (c.totalRevenue || 0), 0);

  if (loading) {
    return (
      <div className="admin-cars">
        <div className="loading-state">
          <RefreshCw size={40} className="spinning" />
          <p>Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-cars">
      <div className="cars-header">
        <div>
          <h1 className="cars-title">Cars Management</h1>
          <p className="cars-subtitle">Manage car rentals and availability</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchCars}>
            <RefreshCw size={20} />
          </button>
          <button className="add-car-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={20} />
            Add Car
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="cars-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by car name, location, or ID..."
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
            <Car size={18} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              {carTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="cars-stats">
        <div className="stat-item">
          <div className="stat-icon total">
            <Car size={20} />
          </div>
          <div>
            <div className="stat-value">{totalCars}</div>
            <div className="stat-label">Total Cars</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon available">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{availableCars}</div>
            <div className="stat-label">Available</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon rentals">
            <Users size={20} />
          </div>
          <div>
            <div className="stat-value">{totalRentals}</div>
            <div className="stat-label">Total Rentals</div>
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
      {cars.length === 0 ? (
        <div className="no-results">
          <AlertCircle size={48} />
          <p>No cars added yet</p>
          <span>Click "Add Car" to add your first vehicle</span>
          <button className="add-car-btn" onClick={() => setShowAddModal(true)} style={{ marginTop: '1rem' }}>
            <Plus size={20} />
            Add Car
          </button>
        </div>
      ) : (
        /* Cars Grid */
        <div className="cars-grid">
          {filteredCars.map((car) => (
            <div key={car.id} className="car-card">
              <div className="car-card-image-wrapper">
                {car.images && car.images[0] ? (
                  <img
                    src={car.images[0]}
                    alt={`${car.make} ${car.model}`}
                    className="car-card-image"
                  />
                ) : (
                  <div className="car-card-image-placeholder">
                    <Car size={48} />
                  </div>
                )}
                <span className={`status-badge ${getStatusClass(car.status)}`}>
                  {car.status || 'Active'}
                </span>
              </div>

              <div className="car-card-body">
                <h3 className="car-name">{car.make} {car.model}</h3>
                <p className="car-id">{car.id.slice(0, 8)}...</p>

                <div className="car-details">
                  <div className="detail-item">
                    <MapPin size={14} />
                    <span>{car.location || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <Settings size={14} />
                    <span>{car.transmission || 'Automatic'}</span>
                  </div>
                  <div className="detail-item">
                    <Fuel size={14} />
                    <span>{car.fuelType || 'Petrol'}</span>
                  </div>
                  <div className="detail-item">
                    <Users size={14} />
                    <span>{car.seats || 5} seats</span>
                  </div>
                </div>

                <div className="car-stats">
                  <div className="car-stat">
                    <div className="car-stat-value">{car.totalRentals || 0}</div>
                    <div className="car-stat-label">Rentals</div>
                  </div>
                  <div className="car-stat">
                    <div className="car-stat-value">${(car.totalRevenue || 0).toLocaleString()}</div>
                    <div className="car-stat-label">Revenue</div>
                  </div>
                </div>

                <div className="car-price">
                  <span className="price-label">Price per day</span>
                  <span className="price-value">${car.pricePerDay || 0}</span>
                </div>
              </div>

              <div className="car-card-footer">
                <button className="action-btn view" title="View Details">
                  <Eye size={16} />
                </button>
                <button className="action-btn edit" title="Edit Car" onClick={() => openEditModal(car)}>
                  <Edit size={16} />
                </button>
                <button
                  className={`action-btn ${(car.status || 'active') === 'active' ? 'deactivate' : 'activate'}`}
                  title={(car.status || 'active') === 'active' ? 'Deactivate' : 'Activate'}
                  onClick={() => handleToggleStatus(car)}
                >
                  <Power size={16} />
                </button>
                <button
                  className="action-btn delete"
                  title="Delete Car"
                  onClick={() => handleDeleteCar(car.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cars.length > 0 && filteredCars.length === 0 && (
        <div className="no-results">
          <p>No cars found matching your criteria</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingCar) && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setEditingCar(null); resetForm(); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCar ? 'Edit Car' : 'Add New Car'}</h2>
              <button className="close-btn" onClick={() => { setShowAddModal(false); setEditingCar(null); resetForm(); }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={editingCar ? handleUpdateCar : handleCreateCar} className="car-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Make *</label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    required
                    placeholder="e.g., Toyota"
                  />
                </div>
                <div className="form-group">
                  <label>Model *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                    placeholder="e.g., Camry"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    min="2000"
                    max="2030"
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="sports">Sports</option>
                    <option value="luxury">Luxury</option>
                    <option value="van">Van</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Seats</label>
                  <input
                    type="number"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                    min="2"
                    max="15"
                  />
                </div>
                <div className="form-group">
                  <label>Price per Day ($)</label>
                  <input
                    type="number"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData({ ...formData, pricePerDay: Number(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
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
                <button type="button" className="cancel-btn" onClick={() => { setShowAddModal(false); setEditingCar(null); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingCar ? 'Update Car' : 'Create Car'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCars;
