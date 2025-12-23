import { useState } from 'react';
import {
  Moon, Sun, Bell, Lock, Globe, CreditCard, Shield, Trash2,
  Mail, MessageSquare, Check, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './Settings.css';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [showPassword, setShowPassword] = useState(false);

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    bookingConfirmation: true,
    promotionalEmails: false,
    newsletterSubscription: true,
    smsNotifications: false
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowDataCollection: true,
    twoFactorAuth: false
  });

  // Account Settings
  const [accountSettings, setAccountSettings] = useState({
    language: 'en',
    currency: 'USD',
    timezone: 'America/New_York'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: <Sun size={20} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={20} /> },
    { id: 'privacy', name: 'Privacy & Security', icon: <Shield size={20} /> },
    { id: 'account', name: 'Account', icon: <Lock size={20} /> },
    { id: 'payment', name: 'Payment Methods', icon: <CreditCard size={20} /> }
  ];

  const handleDarkModeToggle = () => {
    toggleTheme();
    toast.success(`${isDark ? 'Light' : 'Dark'} mode enabled`);
  };

  const handleNotificationChange = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
    toast.success('Notification settings updated');
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy({
      ...privacy,
      [key]: value
    });
    toast.success('Privacy settings updated');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.success('Account deletion request submitted');
    }
  };

  return (
    <>
      <SEO
        title="Settings | Zanafly"
        description="Manage your account settings and preferences"
        keywords="settings, account settings, preferences"
        canonical="/settings"
      />

      <div className="settings-page">
        <Header />

        <div className="settings-content">
          <div className="container">
            <h1 className="settings-page-title">Settings</h1>

            <div className="settings-layout">
              {/* Sidebar Navigation */}
              <aside className="settings-sidebar">
                <nav className="settings-nav">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                    >
                      {tab.icon}
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </aside>

              {/* Main Content */}
              <main className="settings-main">
                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                  <div className="settings-section">
                    <h2 className="settings-section-title">Appearance</h2>
                    <p className="settings-section-description">
                      Customize how Zanafly looks on your device
                    </p>

                    <div className="settings-card">
                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div className="settings-item-header">
                            <div className="settings-item-icon">
                              {isDark ? <Moon size={24} /> : <Sun size={24} />}
                            </div>
                            <div>
                              <h3 className="settings-item-title">Theme</h3>
                              <p className="settings-item-description">
                                Choose between light and dark mode
                              </p>
                            </div>
                          </div>
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={isDark}
                              onChange={handleDarkModeToggle}
                            />
                            <span className="settings-toggle-slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-divider"></div>

                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div>
                            <h3 className="settings-item-title">Display Language</h3>
                            <p className="settings-item-description">
                              Select your preferred language
                            </p>
                          </div>
                          <select
                            className="settings-select"
                            value={accountSettings.language}
                            onChange={(e) => setAccountSettings({...accountSettings, language: e.target.value})}
                          >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                            <option value="ja">日本語</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="settings-section">
                    <h2 className="settings-section-title">Notifications</h2>
                    <p className="settings-section-description">
                      Manage how you receive notifications
                    </p>

                    <div className="settings-card">
                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div className="settings-item-header">
                            <div className="settings-item-icon">
                              <Mail size={24} />
                            </div>
                            <div>
                              <h3 className="settings-item-title">Email Notifications</h3>
                              <p className="settings-item-description">
                                Receive updates via email
                              </p>
                            </div>
                          </div>
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={notifications.emailNotifications}
                              onChange={() => handleNotificationChange('emailNotifications')}
                            />
                            <span className="settings-toggle-slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-divider"></div>

                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div className="settings-item-header">
                            <div className="settings-item-icon">
                              <Bell size={24} />
                            </div>
                            <div>
                              <h3 className="settings-item-title">Push Notifications</h3>
                              <p className="settings-item-description">
                                Get notified about important updates
                              </p>
                            </div>
                          </div>
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={notifications.pushNotifications}
                              onChange={() => handleNotificationChange('pushNotifications')}
                            />
                            <span className="settings-toggle-slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-divider"></div>

                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div className="settings-item-header">
                            <div className="settings-item-icon">
                              <Check size={24} />
                            </div>
                            <div>
                              <h3 className="settings-item-title">Booking Confirmations</h3>
                              <p className="settings-item-description">
                                Confirmation emails for your bookings
                              </p>
                            </div>
                          </div>
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={notifications.bookingConfirmation}
                              onChange={() => handleNotificationChange('bookingConfirmation')}
                            />
                            <span className="settings-toggle-slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-divider"></div>

                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div>
                            <h3 className="settings-item-title">Promotional Emails</h3>
                            <p className="settings-item-description">
                              Receive special offers and deals
                            </p>
                          </div>
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={notifications.promotionalEmails}
                              onChange={() => handleNotificationChange('promotionalEmails')}
                            />
                            <span className="settings-toggle-slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-divider"></div>

                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div>
                            <h3 className="settings-item-title">Newsletter Subscription</h3>
                            <p className="settings-item-description">
                              Travel tips and inspiration
                            </p>
                          </div>
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={notifications.newsletterSubscription}
                              onChange={() => handleNotificationChange('newsletterSubscription')}
                            />
                            <span className="settings-toggle-slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-divider"></div>

                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div className="settings-item-header">
                            <div className="settings-item-icon">
                              <MessageSquare size={24} />
                            </div>
                            <div>
                              <h3 className="settings-item-title">SMS Notifications</h3>
                              <p className="settings-item-description">
                                Get text updates about your bookings
                              </p>
                            </div>
                          </div>
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={notifications.smsNotifications}
                              onChange={() => handleNotificationChange('smsNotifications')}
                            />
                            <span className="settings-toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Privacy & Security Settings */}
                {activeTab === 'privacy' && (
                  <div className="settings-section">
                    <h2 className="settings-section-title">Privacy & Security</h2>
                    <p className="settings-section-description">
                      Manage your privacy and security preferences
                    </p>

                    <div className="settings-card">
                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div>
                            <h3 className="settings-item-title">Profile Visibility</h3>
                            <p className="settings-item-description">
                              Control who can see your profile
                            </p>
                          </div>
                          <select
                            className="settings-select"
                            value={privacy.profileVisibility}
                            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                          >
                            <option value="public">Public</option>
                            <option value="friends">Friends Only</option>
                            <option value="private">Private</option>
                          </select>
                        </div>
                      </div>

                      <div className="settings-divider"></div>

                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div>
                            <h3 className="settings-item-title">Show Email Address</h3>
                            <p className="settings-item-description">
                              Display your email on your profile
                            </p>
                          </div>
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={privacy.showEmail}
                              onChange={() => handlePrivacyChange('showEmail', !privacy.showEmail)}
                            />
                            <span className="settings-toggle-slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-divider"></div>

                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div>
                            <h3 className="settings-item-title">Show Phone Number</h3>
                            <p className="settings-item-description">
                              Display your phone on your profile
                            </p>
                          </div>
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={privacy.showPhone}
                              onChange={() => handlePrivacyChange('showPhone', !privacy.showPhone)}
                            />
                            <span className="settings-toggle-slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-divider"></div>

                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div>
                            <h3 className="settings-item-title">Data Collection</h3>
                            <p className="settings-item-description">
                              Allow us to collect data to improve your experience
                            </p>
                          </div>
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={privacy.allowDataCollection}
                              onChange={() => handlePrivacyChange('allowDataCollection', !privacy.allowDataCollection)}
                            />
                            <span className="settings-toggle-slider"></span>
                          </label>
                        </div>
                      </div>

                      <div className="settings-divider"></div>

                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div className="settings-item-header">
                            <div className="settings-item-icon">
                              <Shield size={24} />
                            </div>
                            <div>
                              <h3 className="settings-item-title">Two-Factor Authentication</h3>
                              <p className="settings-item-description">
                                Add an extra layer of security
                              </p>
                            </div>
                          </div>
                          <label className="settings-toggle">
                            <input
                              type="checkbox"
                              checked={privacy.twoFactorAuth}
                              onChange={() => handlePrivacyChange('twoFactorAuth', !privacy.twoFactorAuth)}
                            />
                            <span className="settings-toggle-slider"></span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Change Password */}
                    <div className="settings-card" style={{ marginTop: 'var(--spacing-xl)' }}>
                      <h3 className="settings-card-title">Change Password</h3>
                      <form onSubmit={handlePasswordChange} className="settings-password-form">
                        <div className="settings-form-group">
                          <label className="settings-form-label">Current Password</label>
                          <div className="settings-password-input">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className="settings-input"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="settings-password-toggle"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <div className="settings-form-group">
                          <label className="settings-form-label">New Password</label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="settings-input"
                            required
                          />
                        </div>
                        <div className="settings-form-group">
                          <label className="settings-form-label">Confirm New Password</label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="settings-input"
                            required
                          />
                        </div>
                        <button type="submit" className="settings-btn-primary">
                          Update Password
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* Account Settings */}
                {activeTab === 'account' && (
                  <div className="settings-section">
                    <h2 className="settings-section-title">Account Settings</h2>
                    <p className="settings-section-description">
                      Manage your account preferences
                    </p>

                    <div className="settings-card">
                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div className="settings-item-header">
                            <div className="settings-item-icon">
                              <Globe size={24} />
                            </div>
                            <div>
                              <h3 className="settings-item-title">Currency</h3>
                              <p className="settings-item-description">
                                Select your preferred currency
                              </p>
                            </div>
                          </div>
                          <select
                            className="settings-select"
                            value={accountSettings.currency}
                            onChange={(e) => setAccountSettings({...accountSettings, currency: e.target.value})}
                          >
                            <option value="USD">USD - US Dollar</option>
                            <option value="EUR">EUR - Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="JPY">JPY - Japanese Yen</option>
                            <option value="AUD">AUD - Australian Dollar</option>
                          </select>
                        </div>
                      </div>

                      <div className="settings-divider"></div>

                      <div className="settings-item">
                        <div className="settings-item-content">
                          <div>
                            <h3 className="settings-item-title">Timezone</h3>
                            <p className="settings-item-description">
                              Select your timezone
                            </p>
                          </div>
                          <select
                            className="settings-select"
                            value={accountSettings.timezone}
                            onChange={(e) => setAccountSettings({...accountSettings, timezone: e.target.value})}
                          >
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="settings-danger-zone">
                      <h3 className="settings-danger-title">Danger Zone</h3>
                      <div className="settings-danger-card">
                        <div>
                          <h4 className="settings-danger-item-title">Delete Account</h4>
                          <p className="settings-danger-item-description">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                        </div>
                        <button onClick={handleDeleteAccount} className="settings-btn-danger">
                          <Trash2 size={18} />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                {activeTab === 'payment' && (
                  <div className="settings-section">
                    <h2 className="settings-section-title">Payment Methods</h2>
                    <p className="settings-section-description">
                      Manage your saved payment methods
                    </p>

                    <div className="settings-card">
                      <div className="settings-payment-empty">
                        <CreditCard size={48} />
                        <h3>No payment methods saved</h3>
                        <p>Add a payment method to make bookings faster and easier</p>
                        <button className="settings-btn-primary">
                          Add Payment Method
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Settings;
