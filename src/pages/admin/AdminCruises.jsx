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
  Ship,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Calendar,
  Anchor
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminCruises.css';

const AdminCruises = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDestination, setFilterDestination] = useState('all');

  // Mock data - will be replaced with API data
  const [cruises] = useState([
    {
      id: 'CRU001',
      name: 'Caribbean Paradise',
      cruiseLine: 'Royal Caribbean',
      shipName: 'Harmony of the Seas',
      destination: 'Caribbean Islands',
      ports: ['Jamaica', 'Cozumel', 'Bahamas'],
      duration: '7 nights',
      departure: 'Miami, FL',
      departureDate: '2025-12-15',
      capacity: 2500,
      booked: 1850,
      pricePerPerson: 1200,
      status: 'Available',
      rating: 4.8,
      amenities: ['Pool', 'Casino', 'Spa', 'Theater', 'Kids Club'],
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      bookings: 156,
      revenue: 187200
    },
    {
      id: 'CRU002',
      name: 'Mediterranean Dream',
      cruiseLine: 'MSC Cruises',
      shipName: 'MSC Meraviglia',
      destination: 'Mediterranean',
      ports: ['Barcelona', 'Rome', 'Athens', 'Naples'],
      duration: '10 nights',
      departure: 'Barcelona, Spain',
      departureDate: '2025-11-20',
      capacity: 3000,
      booked: 2450,
      pricePerPerson: 1800,
      status: 'Available',
      rating: 4.9,
      amenities: ['Pool', 'Spa', 'Fine Dining', 'Theater', 'Casino'],
      image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=400',
      bookings: 189,
      revenue: 340200
    },
    {
      id: 'CRU003',
      name: 'Alaska Expedition',
      cruiseLine: 'Norwegian Cruise Line',
      shipName: 'Norwegian Bliss',
      destination: 'Alaska',
      ports: ['Juneau', 'Ketchikan', 'Skagway', 'Glacier Bay'],
      duration: '8 nights',
      departure: 'Seattle, WA',
      departureDate: '2026-05-15',
      capacity: 2200,
      booked: 1200,
      pricePerPerson: 1500,
      status: 'Available',
      rating: 4.7,
      amenities: ['Pool', 'Spa', 'Observatory', 'Casino', 'Kids Club'],
      image: 'https://images.unsplash.com/photo-1564056505735-8a1f6d5c4f8c?w=400',
      bookings: 98,
      revenue: 147000
    },
    {
      id: 'CRU004',
      name: 'Asian Explorer',
      cruiseLine: 'Celebrity Cruises',
      shipName: 'Celebrity Solstice',
      destination: 'Southeast Asia',
      ports: ['Singapore', 'Bangkok', 'Ho Chi Minh', 'Hong Kong'],
      duration: '12 nights',
      departure: 'Singapore',
      departureDate: '2026-01-10',
      capacity: 2800,
      booked: 2800,
      pricePerPerson: 2200,
      status: 'Sold Out',
      rating: 4.9,
      amenities: ['Pool', 'Spa', 'Fine Dining', 'Lawn Club', 'Theater'],
      image: 'https://images.unsplash.com/photo-1569437061238-3cf61084f487?w=400',
      bookings: 234,
      revenue: 514800
    },
    {
      id: 'CRU005',
      name: 'Pacific Islands',
      cruiseLine: 'Princess Cruises',
      shipName: 'Regal Princess',
      destination: 'South Pacific',
      ports: ['Fiji', 'Bora Bora', 'Tahiti', 'Moorea'],
      duration: '14 nights',
      departure: 'Los Angeles, CA',
      departureDate: '2026-02-01',
      capacity: 2600,
      booked: 950,
      pricePerPerson: 2800,
      status: 'Available',
      rating: 4.8,
      amenities: ['Pool', 'Spa', 'Fine Dining', 'Movies Under Stars', 'Casino'],
      image: 'https://images.unsplash.com/photo-1589870335807-47adad035ea6?w=400',
      bookings: 76,
      revenue: 212800
    },
    {
      id: 'CRU006',
      name: 'Northern Europe',
      cruiseLine: 'Holland America',
      shipName: 'Nieuw Statendam',
      destination: 'Northern Europe',
      ports: ['Copenhagen', 'Stockholm', 'St. Petersburg', 'Helsinki'],
      duration: '9 nights',
      departure: 'Amsterdam, Netherlands',
      departureDate: '2026-06-20',
      capacity: 1800,
      booked: 200,
      pricePerPerson: 1900,
      status: 'Cancelled',
      rating: 4.6,
      amenities: ['Pool', 'Spa', 'Fine Dining', 'Music Walk', 'Casino'],
      image: 'https://images.unsplash.com/photo-1535575477716-d2e9c57ce2ad?w=400',
      bookings: 15,
      revenue: 28500
    }
  ]);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'status-available';
      case 'sold out':
        return 'status-soldout';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const filteredCruises = cruises.filter((cruise) => {
    const matchesSearch =
      cruise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cruise.cruiseLine.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cruise.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cruise.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || cruise.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesDestination = filterDestination === 'all' || cruise.destination.toLowerCase().includes(filterDestination.toLowerCase());

    return matchesSearch && matchesStatus && matchesDestination;
  });

  const totalCruises = cruises.length;
  const availableCruises = cruises.filter(c => c.status === 'Available').length;
  const soldOutCruises = cruises.filter(c => c.status === 'Sold Out').length;
  const totalRevenue = cruises.reduce((sum, c) => sum + c.revenue, 0);
  const totalPassengers = cruises.reduce((sum, c) => sum + c.booked, 0);

  const handleToggleStatus = (cruiseId) => {
    toast.success('Cruise status updated successfully!');
  };

  return (
    <div className="admin-cruises">
      <div className="cruises-header">
        <div>
          <h1 className="cruises-title">Cruises Management</h1>
          <p className="cruises-subtitle">Manage cruise bookings and availability</p>
        </div>
        <div className="header-actions">
          <button className="add-cruise-btn">
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
              <option value="Available">Available</option>
              <option value="Sold Out">Sold Out</option>
              <option value="Cancelled">Cancelled</option>
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
            <div className="stat-value">{totalPassengers.toLocaleString()}</div>
            <div className="stat-label">Total Passengers</div>
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
          <strong>Cruise API Integration</strong>
          <p>This section will be connected to cruise line APIs for real-time availability and bookings.</p>
        </div>
      </div>

      {/* Cruises Grid */}
      <div className="cruises-grid">
        {filteredCruises.map((cruise) => (
          <div key={cruise.id} className="cruise-card">
            <div className="cruise-card-image-wrapper">
              <img src={cruise.image} alt={cruise.name} className="cruise-card-image" />
              <span className={`status-badge ${getStatusClass(cruise.status)}`}>
                {cruise.status}
              </span>
              <div className="cruise-rating">
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                <span>{cruise.rating}</span>
              </div>
            </div>

            <div className="cruise-card-body">
              <h3 className="cruise-name">{cruise.name}</h3>
              <p className="cruise-line">
                <Ship size={14} />
                {cruise.cruiseLine} • {cruise.shipName}
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
                    <div className="detail-value">{cruise.duration}</div>
                  </div>
                </div>
                <div className="detail-item">
                  <Anchor size={14} />
                  <div>
                    <div className="detail-label">Departure</div>
                    <div className="detail-value">{cruise.departure}</div>
                  </div>
                </div>
              </div>

              <div className="cruise-ports">
                <div className="ports-label">Ports of Call:</div>
                <div className="ports-list">
                  {cruise.ports.map((port, index) => (
                    <span key={index} className="port-tag">
                      {port}
                    </span>
                  ))}
                </div>
              </div>

              <div className="cruise-capacity">
                <div className="capacity-bar-container">
                  <div className="capacity-bar-label">
                    <Users size={14} />
                    <span>Capacity: {cruise.booked} / {cruise.capacity}</span>
                  </div>
                  <div className="capacity-bar">
                    <div
                      className="capacity-bar-fill"
                      style={{ width: `${(cruise.booked / cruise.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="cruise-info-grid">
                <div className="info-item">
                  <Calendar size={16} />
                  <div>
                    <div className="info-value">{cruise.departureDate}</div>
                    <div className="info-label">Departure Date</div>
                  </div>
                </div>
                <div className="info-item">
                  <Users size={16} />
                  <div>
                    <div className="info-value">{cruise.bookings}</div>
                    <div className="info-label">Total Bookings</div>
                  </div>
                </div>
              </div>

              <div className="cruise-price">
                <div>
                  <span className="price-label">From</span>
                  <span className="price-value">${cruise.pricePerPerson.toLocaleString()}</span>
                  <span className="price-unit">/person</span>
                </div>
              </div>

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

              <div className="cruise-revenue">
                <DollarSign size={14} />
                <span>Revenue: ${cruise.revenue.toLocaleString()}</span>
              </div>
            </div>

            <div className="cruise-card-footer">
              <button className="action-btn view" title="View Details">
                <Eye size={16} />
              </button>
              <button className="action-btn edit" title="Edit Cruise">
                <Edit size={16} />
              </button>
              <button
                className={`action-btn ${cruise.status === 'Available' ? 'deactivate' : 'activate'}`}
                title={cruise.status === 'Available' ? 'Mark Unavailable' : 'Mark Available'}
                onClick={() => handleToggleStatus(cruise.id)}
              >
                <Power size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCruises.length === 0 && (
        <div className="no-results">
          <p>No cruises found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default AdminCruises;
