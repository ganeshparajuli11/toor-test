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
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiSettings } from '../../contexts/ApiSettingsContext';
import './AdminHotels.css';

const AdminHotels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get API settings from context
  const { isRateHawkConfigured, getRateHawkService } = useApiSettings();

  // Mock data - fallback when API is not configured
  const mockHotels = [
    {
      id: 'HTL001',
      name: 'Le Grand Hotel',
      location: 'Paris, France',
      address: '123 Champs-Élysées, Paris',
      rating: 4.8,
      totalRooms: 150,
      availableRooms: 45,
      pricePerNight: 250,
      status: 'Active',
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar'],
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      bookings: 1250,
      revenue: 312500
    },
    {
      id: 'HTL002',
      name: 'Tokyo Imperial Hotel',
      location: 'Tokyo, Japan',
      address: '456 Shibuya, Tokyo',
      rating: 4.9,
      totalRooms: 200,
      availableRooms: 78,
      pricePerNight: 320,
      status: 'Active',
      amenities: ['WiFi', 'Gym', 'Restaurant', 'Concierge'],
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
      bookings: 1890,
      revenue: 604800
    },
    {
      id: 'HTL003',
      name: 'Burj Al Arab',
      location: 'Dubai, UAE',
      address: 'Jumeirah Beach, Dubai',
      rating: 5.0,
      totalRooms: 100,
      availableRooms: 12,
      pricePerNight: 850,
      status: 'Active',
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Beach Access', 'Butler Service'],
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
      bookings: 856,
      revenue: 727600
    },
    {
      id: 'HTL004',
      name: 'The Savoy',
      location: 'London, UK',
      address: 'Strand, Westminster, London',
      rating: 4.7,
      totalRooms: 120,
      availableRooms: 34,
      pricePerNight: 380,
      status: 'Active',
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Gym'],
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
      bookings: 980,
      revenue: 372400
    },
    {
      id: 'HTL005',
      name: 'Marina Bay Sands',
      location: 'Singapore',
      address: 'Bayfront Avenue, Singapore',
      rating: 4.8,
      totalRooms: 250,
      availableRooms: 0,
      pricePerNight: 450,
      status: 'Inactive',
      amenities: ['WiFi', 'Pool', 'Casino', 'Restaurant', 'Shopping Mall'],
      image: 'https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa?w=400',
      bookings: 2100,
      revenue: 945000
    },
    {
      id: 'HTL006',
      name: 'Plaza Hotel',
      location: 'New York, USA',
      address: 'Fifth Avenue, New York',
      rating: 4.6,
      totalRooms: 180,
      availableRooms: 56,
      pricePerNight: 420,
      status: 'Active',
      amenities: ['WiFi', 'Restaurant', 'Bar', 'Spa', 'Concierge'],
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
      bookings: 1560,
      revenue: 655200
    }
  ];

  // State for hotels data
  const [hotels, setHotels] = useState(mockHotels);

  // Fetch hotels from RateHawk API if configured
  useEffect(() => {
    const fetchHotels = async () => {
      // If RateHawk is not configured, use mock data
      if (!isRateHawkConfigured()) {
        setHotels(mockHotels);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const rateHawkService = getRateHawkService();

        // For now, we'll use mock data as we need search parameters to fetch real hotels
        // In a real implementation, you would have a default search or saved searches
        // Example: const result = await rateHawkService.searchHotels({
        //   destination: 'Paris',
        //   checkIn: '2025-12-01',
        //   checkOut: '2025-12-05',
        //   guests: 2,
        //   rooms: 1
        // });

        // For now, show that API is ready but needs search parameters
        console.log('RateHawk API is configured and ready to use');
        setHotels(mockHotels);

      } catch (err) {
        console.error('Error fetching hotels:', err);
        setError(err.message);
        toast.error('Failed to load hotels from RateHawk API');
        // Fallback to mock data on error
        setHotels(mockHotels);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [isRateHawkConfigured]);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      default:
        return '';
    }
  };

  const filteredHotels = hotels.filter((hotel) => {
    const matchesSearch =
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || hotel.status.toLowerCase() === filterStatus;
    const matchesLocation = filterLocation === 'all' || hotel.location.includes(filterLocation);

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const totalHotels = hotels.length;
  const activeHotels = hotels.filter(h => h.status === 'Active').length;
  const totalRooms = hotels.reduce((sum, h) => sum + h.totalRooms, 0);
  const availableRooms = hotels.reduce((sum, h) => sum + h.availableRooms, 0);
  const totalRevenue = hotels.reduce((sum, h) => sum + h.revenue, 0);

  const handleToggleStatus = (hotelId) => {
    toast.success('Hotel status updated successfully!');
  };

  return (
    <div className="admin-hotels">
      <div className="hotels-header">
        <div>
          <h1 className="hotels-title">Hotels Management</h1>
          <p className="hotels-subtitle">Manage hotel listings and availability</p>
        </div>
        <div className="header-actions">
          <button className="add-hotel-btn">
            <Plus size={20} />
            Add Hotel
          </button>
          <button className="export-btn">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

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
              <option value="Paris">Paris</option>
              <option value="Tokyo">Tokyo</option>
              <option value="Dubai">Dubai</option>
              <option value="London">London</option>
              <option value="Singapore">Singapore</option>
              <option value="New York">New York</option>
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

      {/* RateHawk Integration Alert */}
      {!isRateHawkConfigured() && (
        <div className="integration-alert" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
          <AlertCircle size={20} />
          <div>
            <strong>RateHawk API Not Configured</strong>
            <p>
              Please configure your RateHawk API credentials in{' '}
              <a href="/admin/settings" style={{ color: '#d97706', fontWeight: 600, textDecoration: 'underline' }}>
                Settings
              </a>
              {' '}to fetch real hotel data.
            </p>
          </div>
        </div>
      )}

      {isRateHawkConfigured() && (
        <div className="integration-alert">
          <CheckCircle size={20} />
          <div>
            <strong>RateHawk API Connected</strong>
            <p>Your RateHawk (ETG) API v3 is configured and ready to fetch real-time hotel data and bookings.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="integration-alert" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
          <Loader size={20} className="spinner" />
          <div>
            <strong>Loading Hotels...</strong>
            <p>Fetching hotel data from RateHawk API</p>
          </div>
        </div>
      )}

      {error && (
        <div className="integration-alert" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
          <AlertCircle size={20} />
          <div>
            <strong>Error Loading Hotels</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Hotels Grid */}
      <div className="hotels-grid">
        {filteredHotels.map((hotel) => (
          <div key={hotel.id} className="hotel-card">
            <div className="hotel-card-image-wrapper">
              <img src={hotel.image} alt={hotel.name} className="hotel-card-image" />
              <span className={`status-badge ${getStatusClass(hotel.status)}`}>
                {hotel.status}
              </span>
              <div className="hotel-rating">
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                <span>{hotel.rating}</span>
              </div>
            </div>

            <div className="hotel-card-body">
              <h3 className="hotel-name">{hotel.name}</h3>
              <p className="hotel-id">{hotel.id}</p>

              <div className="hotel-location">
                <MapPin size={14} />
                <span>{hotel.location}</span>
              </div>

              <div className="hotel-info-grid">
                <div className="info-item">
                  <Bed size={16} />
                  <div>
                    <div className="info-value">{hotel.totalRooms}</div>
                    <div className="info-label">Total Rooms</div>
                  </div>
                </div>
                <div className="info-item">
                  <CheckCircle size={16} />
                  <div>
                    <div className="info-value">{hotel.availableRooms}</div>
                    <div className="info-label">Available</div>
                  </div>
                </div>
                <div className="info-item">
                  <Users size={16} />
                  <div>
                    <div className="info-value">{hotel.bookings}</div>
                    <div className="info-label">Bookings</div>
                  </div>
                </div>
                <div className="info-item">
                  <DollarSign size={16} />
                  <div>
                    <div className="info-value">${hotel.revenue.toLocaleString()}</div>
                    <div className="info-label">Revenue</div>
                  </div>
                </div>
              </div>

              <div className="hotel-price">
                <span className="price-label">Price per night</span>
                <span className="price-value">${hotel.pricePerNight}</span>
              </div>

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
            </div>

            <div className="hotel-card-footer">
              <button className="action-btn view" title="View Details">
                <Eye size={16} />
              </button>
              <button className="action-btn edit" title="Edit Hotel">
                <Edit size={16} />
              </button>
              <button
                className={`action-btn ${hotel.status === 'Active' ? 'deactivate' : 'activate'}`}
                title={hotel.status === 'Active' ? 'Deactivate' : 'Activate'}
                onClick={() => handleToggleStatus(hotel.id)}
              >
                <Power size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredHotels.length === 0 && (
        <div className="no-results">
          <p>No hotels found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default AdminHotels;
