import { useState } from 'react';
import { Camera, MapPin, Calendar, Award, Edit2, Save, X, Globe, Heart, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    bio: 'Travel enthusiast exploring the world one destination at a time. Love adventure, culture, and meeting new people.',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    nationality: 'American'
  });

  const stats = [
    { label: 'Countries Visited', value: '23', icon: <Globe size={24} /> },
    { label: 'Total Trips', value: '47', icon: <MapPin size={24} /> },
    { label: 'Saved Places', value: '156', icon: <Heart size={24} /> },
    { label: 'Reviews Written', value: '28', icon: <Award size={24} /> }
  ];

  const savedDestinations = [
    { name: 'Paris, France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=200&fit=crop' },
    { name: 'Tokyo, Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop' },
    { name: 'Bali, Indonesia', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=300&h=200&fit=crop' },
    { name: 'New York, USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&h=200&fit=crop' }
  ];

  const travelPreferences = {
    travelStyle: ['Adventure', 'Cultural', 'Beach'],
    accommodation: 'Hotels & Resorts',
    budget: 'Mid-range to Luxury',
    interests: ['Photography', 'Food & Wine', 'History', 'Nature']
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save profile logic here
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || 'John Doe',
      email: user?.email || 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, USA',
      bio: 'Travel enthusiast exploring the world one destination at a time. Love adventure, culture, and meeting new people.',
      dateOfBirth: '1990-05-15',
      gender: 'Male',
      nationality: 'American'
    });
    setIsEditing(false);
  };

  return (
    <>
      <SEO
        title="My Profile | TOOR"
        description="Manage your profile and travel preferences"
        keywords="profile, user profile, travel profile"
        canonical="/profile"
      />

      <div className="profile-page">
        <Header />

        <div className="profile-content">
          <div className="container">
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-header-bg"></div>
              <div className="profile-header-content">
                <div className="profile-avatar-wrapper">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'}
                    alt={formData.name}
                    className="profile-avatar-large"
                  />
                  <button className="profile-avatar-edit">
                    <Camera size={20} />
                  </button>
                </div>
                <div className="profile-header-info">
                  <h1 className="profile-name">{formData.name}</h1>
                  <p className="profile-location">
                    <MapPin size={16} />
                    {formData.location}
                  </p>
                  <p className="profile-bio">{formData.bio}</p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="profile-edit-btn"
                >
                  {isEditing ? (
                    <>
                      <X size={20} />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 size={20} />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="profile-stats">
              {stats.map((stat, index) => (
                <div key={index} className="profile-stat-card">
                  <div className="profile-stat-icon">{stat.icon}</div>
                  <div className="profile-stat-value">{stat.value}</div>
                  <div className="profile-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="profile-layout">
              {/* Main Content */}
              <div className="profile-main">
                {/* Edit Form / Info Display */}
                {isEditing ? (
                  <div className="profile-card">
                    <h2 className="profile-card-title">Edit Profile Information</h2>
                    <form onSubmit={handleSubmit} className="profile-form">
                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label className="profile-form-label">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="profile-form-input"
                          />
                        </div>
                        <div className="profile-form-group">
                          <label className="profile-form-label">Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="profile-form-input"
                          />
                        </div>
                      </div>

                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label className="profile-form-label">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="profile-form-input"
                          />
                        </div>
                        <div className="profile-form-group">
                          <label className="profile-form-label">Location</label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="profile-form-input"
                          />
                        </div>
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label">Bio</label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          className="profile-form-textarea"
                          rows="3"
                        />
                      </div>

                      <div className="profile-form-row">
                        <div className="profile-form-group">
                          <label className="profile-form-label">Date of Birth</label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="profile-form-input"
                          />
                        </div>
                        <div className="profile-form-group">
                          <label className="profile-form-label">Gender</label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="profile-form-input"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </div>
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label">Nationality</label>
                        <input
                          type="text"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                          className="profile-form-input"
                        />
                      </div>

                      <div className="profile-form-actions">
                        <button type="button" onClick={handleCancel} className="profile-btn-secondary">
                          Cancel
                        </button>
                        <button type="submit" className="profile-btn-primary">
                          <Save size={20} />
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="profile-card">
                    <h2 className="profile-card-title">Personal Information</h2>
                    <div className="profile-info-grid">
                      <div className="profile-info-item">
                        <span className="profile-info-label">Email</span>
                        <span className="profile-info-value">{formData.email}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="profile-info-label">Phone</span>
                        <span className="profile-info-value">{formData.phone}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="profile-info-label">Date of Birth</span>
                        <span className="profile-info-value">
                          {new Date(formData.dateOfBirth).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="profile-info-item">
                        <span className="profile-info-label">Gender</span>
                        <span className="profile-info-value">{formData.gender}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="profile-info-label">Nationality</span>
                        <span className="profile-info-value">{formData.nationality}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Travel Preferences */}
                <div className="profile-card">
                  <h2 className="profile-card-title">
                    <Briefcase size={20} />
                    Travel Preferences
                  </h2>
                  <div className="profile-preferences">
                    <div className="profile-preference-item">
                      <span className="profile-preference-label">Travel Style</span>
                      <div className="profile-preference-tags">
                        {travelPreferences.travelStyle.map((style, index) => (
                          <span key={index} className="profile-tag">{style}</span>
                        ))}
                      </div>
                    </div>
                    <div className="profile-preference-item">
                      <span className="profile-preference-label">Accommodation</span>
                      <span className="profile-preference-value">{travelPreferences.accommodation}</span>
                    </div>
                    <div className="profile-preference-item">
                      <span className="profile-preference-label">Budget Range</span>
                      <span className="profile-preference-value">{travelPreferences.budget}</span>
                    </div>
                    <div className="profile-preference-item">
                      <span className="profile-preference-label">Interests</span>
                      <div className="profile-preference-tags">
                        {travelPreferences.interests.map((interest, index) => (
                          <span key={index} className="profile-tag">{interest}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside className="profile-sidebar">
                {/* Saved Destinations */}
                <div className="profile-card">
                  <h3 className="profile-card-title">
                    <Heart size={20} />
                    Saved Destinations
                  </h3>
                  <div className="profile-saved-destinations">
                    {savedDestinations.map((destination, index) => (
                      <div key={index} className="profile-destination-card">
                        <img
                          src={destination.image}
                          alt={destination.name}
                          className="profile-destination-image"
                        />
                        <div className="profile-destination-overlay">
                          <span className="profile-destination-name">{destination.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="profile-view-all-btn">View All Saved Places</button>
                </div>

                {/* Quick Actions */}
                <div className="profile-card">
                  <h3 className="profile-card-title">Quick Actions</h3>
                  <div className="profile-quick-actions">
                    <button className="profile-action-btn">
                      <Calendar size={18} />
                      My Bookings
                    </button>
                    <button className="profile-action-btn">
                      <Award size={18} />
                      My Reviews
                    </button>
                    <button className="profile-action-btn">
                      <Heart size={18} />
                      Wishlist
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Profile;
