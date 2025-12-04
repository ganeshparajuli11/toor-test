import { useState } from 'react';
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
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminCars.css';

const AdminCars = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock data - will be replaced with API data
  const [cars] = useState([
    {
      id: 'CAR001',
      model: 'Tesla Model 3',
      brand: 'Tesla',
      type: 'Electric Sedan',
      location: 'Los Angeles, USA',
      year: 2024,
      seats: 5,
      transmission: 'Automatic',
      fuelType: 'Electric',
      pricePerDay: 120,
      status: 'Available',
      rating: 4.8,
      features: ['GPS', 'Bluetooth', 'USB', 'Autopilot'],
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400',
      bookings: 245,
      revenue: 29400,
      mileage: 'Unlimited'
    },
    {
      id: 'CAR002',
      model: 'BMW 5 Series',
      brand: 'BMW',
      type: 'Luxury Sedan',
      location: 'New York, USA',
      year: 2023,
      seats: 5,
      transmission: 'Automatic',
      fuelType: 'Gasoline',
      pricePerDay: 150,
      status: 'Available',
      rating: 4.9,
      features: ['GPS', 'Leather Seats', 'Sunroof', 'Premium Audio'],
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
      bookings: 189,
      revenue: 28350,
      mileage: 'Unlimited'
    },
    {
      id: 'CAR003',
      model: 'Range Rover Sport',
      brand: 'Land Rover',
      type: 'Luxury SUV',
      location: 'Dubai, UAE',
      year: 2024,
      seats: 7,
      transmission: 'Automatic',
      fuelType: 'Diesel',
      pricePerDay: 250,
      status: 'Available',
      rating: 4.7,
      features: ['GPS', 'Leather Seats', '4WD', 'Premium Audio', 'Sunroof'],
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400',
      bookings: 167,
      revenue: 41750,
      mileage: '200km/day'
    },
    {
      id: 'CAR004',
      model: 'Toyota Camry',
      brand: 'Toyota',
      type: 'Sedan',
      location: 'Tokyo, Japan',
      year: 2023,
      seats: 5,
      transmission: 'Automatic',
      fuelType: 'Hybrid',
      pricePerDay: 80,
      status: 'Available',
      rating: 4.6,
      features: ['GPS', 'Bluetooth', 'USB', 'Backup Camera'],
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
      bookings: 312,
      revenue: 24960,
      mileage: 'Unlimited'
    },
    {
      id: 'CAR005',
      model: 'Ford Mustang',
      brand: 'Ford',
      type: 'Sports Car',
      location: 'Miami, USA',
      year: 2024,
      seats: 4,
      transmission: 'Manual',
      fuelType: 'Gasoline',
      pricePerDay: 180,
      status: 'Rented',
      rating: 4.9,
      features: ['GPS', 'Bluetooth', 'Premium Audio', 'Sport Mode'],
      image: 'https://images.unsplash.com/photo-1584345604476-8ec5f5f0a09f?w=400',
      bookings: 156,
      revenue: 28080,
      mileage: '150km/day'
    },
    {
      id: 'CAR006',
      model: 'Mercedes-Benz E-Class',
      brand: 'Mercedes',
      type: 'Luxury Sedan',
      location: 'London, UK',
      year: 2023,
      seats: 5,
      transmission: 'Automatic',
      fuelType: 'Diesel',
      pricePerDay: 160,
      status: 'Maintenance',
      rating: 4.8,
      features: ['GPS', 'Leather Seats', 'Sunroof', 'Premium Audio', 'Heated Seats'],
      image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400',
      bookings: 201,
      revenue: 32160,
      mileage: 'Unlimited'
    }
  ]);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'status-available';
      case 'rented':
        return 'status-rented';
      case 'maintenance':
        return 'status-maintenance';
      default:
        return '';
    }
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || car.status.toLowerCase() === filterStatus;
    const matchesType = filterType === 'all' || car.type.toLowerCase().includes(filterType.toLowerCase());

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalCars = cars.length;
  const availableCars = cars.filter(c => c.status === 'Available').length;
  const rentedCars = cars.filter(c => c.status === 'Rented').length;
  const totalRevenue = cars.reduce((sum, c) => sum + c.revenue, 0);

  const handleToggleStatus = (carId) => {
    toast.success('Car status updated successfully!');
  };

  return (
    <div className="admin-cars">
      <div className="cars-header">
        <div>
          <h1 className="cars-title">Cars Management</h1>
          <p className="cars-subtitle">Manage car rentals and fleet availability</p>
        </div>
        <div className="header-actions">
          <button className="add-car-btn">
            <Plus size={20} />
            Add Car
          </button>
          <button className="export-btn">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="cars-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by model, brand, location, or ID..."
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
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
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
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="sports">Sports Car</option>
              <option value="electric">Electric</option>
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
          <div className="stat-icon rented">
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{rentedCars}</div>
            <div className="stat-label">Currently Rented</div>
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

      {/* API Integration Alert */}
      <div className="integration-alert">
        <AlertCircle size={20} />
        <div>
          <strong>Car Rental API Integration</strong>
          <p>This section will be connected to car rental API for real-time vehicle availability and bookings.</p>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="cars-grid">
        {filteredCars.map((car) => (
          <div key={car.id} className="car-card">
            <div className="car-card-image-wrapper">
              <img src={car.image} alt={car.model} className="car-card-image" />
              <span className={`status-badge ${getStatusClass(car.status)}`}>
                {car.status}
              </span>
              <div className="car-rating">
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                <span>{car.rating}</span>
              </div>
            </div>

            <div className="car-card-body">
              <h3 className="car-model">{car.model}</h3>
              <p className="car-brand">{car.brand} • {car.year}</p>

              <div className="car-location">
                <MapPin size={14} />
                <span>{car.location}</span>
              </div>

              <div className="car-specs">
                <div className="spec-item">
                  <Users size={14} />
                  <span>{car.seats} Seats</span>
                </div>
                <div className="spec-item">
                  <Settings size={14} />
                  <span>{car.transmission}</span>
                </div>
                <div className="spec-item">
                  <Fuel size={14} />
                  <span>{car.fuelType}</span>
                </div>
              </div>

              <div className="car-info-grid">
                <div className="info-item">
                  <Car size={16} />
                  <div>
                    <div className="info-value">{car.type}</div>
                    <div className="info-label">Vehicle Type</div>
                  </div>
                </div>
                <div className="info-item">
                  <Users size={16} />
                  <div>
                    <div className="info-value">{car.bookings}</div>
                    <div className="info-label">Total Rentals</div>
                  </div>
                </div>
              </div>

              <div className="car-price">
                <div>
                  <span className="price-label">Price per day</span>
                  <span className="price-value">${car.pricePerDay}</span>
                </div>
                <div className="mileage-info">
                  <span className="mileage-label">Mileage</span>
                  <span className="mileage-value">{car.mileage}</span>
                </div>
              </div>

              <div className="car-features">
                {car.features.slice(0, 3).map((feature, index) => (
                  <span key={index} className="feature-tag">
                    {feature}
                  </span>
                ))}
                {car.features.length > 3 && (
                  <span className="feature-tag more">+{car.features.length - 3}</span>
                )}
              </div>

              <div className="car-revenue">
                <DollarSign size={14} />
                <span>Revenue: ${car.revenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="car-card-footer">
              <button className="action-btn view" title="View Details">
                <Eye size={16} />
              </button>
              <button className="action-btn edit" title="Edit Car">
                <Edit size={16} />
              </button>
              <button
                className={`action-btn ${car.status === 'Available' ? 'deactivate' : 'activate'}`}
                title={car.status === 'Available' ? 'Mark Unavailable' : 'Mark Available'}
                onClick={() => handleToggleStatus(car.id)}
              >
                <Power size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <div className="no-results">
          <p>No cars found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default AdminCars;
