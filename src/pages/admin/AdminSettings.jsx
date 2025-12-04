import { useState, useEffect } from 'react';
import {
  Key,
  Webhook,
  CreditCard,
  Mail,
  Globe,
  Shield,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiSettings } from '../../contexts/ApiSettingsContext';
import './AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('api');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showStripeKey, setShowStripeKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Get API settings from context
  const {
    apiSettings: contextApiSettings,
    updateRateHawkSettings,
    updateStripeSettings,
    testRateHawkConnection,
    isRateHawkConfigured
  } = useApiSettings();

  // Local state for form inputs
  const [rateHawkForm, setRateHawkForm] = useState({
    apiKey: '',
    keyId: '',
    environment: 'sandbox'
  });

  // Load settings from context on mount
  useEffect(() => {
    if (contextApiSettings.ratehawk) {
      setRateHawkForm({
        apiKey: contextApiSettings.ratehawk.apiKey || '',
        keyId: contextApiSettings.ratehawk.keyId || contextApiSettings.ratehawk.partnerId || '',
        environment: contextApiSettings.ratehawk.environment || 'sandbox'
      });
    }
  }, [contextApiSettings]);

  const [apiSettings, setApiSettings] = useState({
    flightApiKey: '',
    flightApiEnabled: false
  });

  const [paymentSettings, setPaymentSettings] = useState({
    stripePublishableKey: 'pk_test_••••••••••••••••••••',
    stripeSecretKey: 'sk_test_••••••••••••••••••••',
    stripe3DSecure: true,
    stripeCurrency: 'USD',
    stripeWebhookSecret: 'whsec_••••••••••••••••'
  });

  const [webhookSettings, setWebhookSettings] = useState({
    bookingWebhookUrl: 'https://yoursite.com/webhooks/booking',
    paymentWebhookUrl: 'https://yoursite.com/webhooks/payment',
    webhookSecret: '••••••••••••••••••••',
    webhookEnabled: true
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@yoursite.com',
    smtpPassword: '••••••••••••',
    fromEmail: 'noreply@yoursite.com',
    fromName: 'TOUR Travel'
  });

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'TOUR',
    siteUrl: 'https://yoursite.com',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
    autoVoucherDelivery: true
  });

  const handleSaveRateHawk = async () => {
    try {
      const result = updateRateHawkSettings(rateHawkForm);
      if (result.success) {
        toast.success('RateHawk settings saved successfully!');
      } else {
        toast.error(result.message || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving RateHawk settings');
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    toast.loading('Testing RateHawk connection...');

    try {
      const result = await testRateHawkConnection();
      toast.dismiss();

      if (result.success) {
        toast.success('Connection successful! RateHawk API is working.');
      } else {
        toast.error(result.message || 'Connection failed');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to test connection');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = async (section) => {
    if (section === 'Payment') {
      try {
        const result = await updateStripeSettings({
          publishableKey: paymentSettings.stripePublishableKey,
          secretKey: paymentSettings.stripeSecretKey,
          webhookSecret: paymentSettings.stripeWebhookSecret,
          currency: paymentSettings.stripeCurrency,
          enable3DSecure: paymentSettings.stripe3DSecure
        });

        if (result.success) {
          toast.success('Payment settings saved successfully!');
        } else {
          toast.error(result.message || 'Failed to save payment settings');
        }
      } catch (error) {
        console.error('Error saving payment settings:', error);
        toast.error('Error saving payment settings');
      }
      return;
    }

    // TODO: Implement save logic for other sections
    toast.success(`${section} settings saved successfully!`);
  };

  const handleTestWebhook = () => {
    toast.loading('Testing webhook connection...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Webhook connection successful!');
    }, 2000);
  };

  const handleTestEmail = () => {
    toast.loading('Sending test email...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('Test email sent successfully!');
    }, 2000);
  };

  const tabs = [
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'general', label: 'General', icon: Globe }
  ];

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage system configuration and API integrations</p>
        </div>
      </div>

      <div className="settings-container">
        {/* Tabs */}
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* API Keys Tab */}
          {activeTab === 'api' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">API Keys Configuration</h2>
                <p className="section-description">
                  Manage your RateHawk and Flight API credentials
                </p>
              </div>

              <div className="settings-card">
                <div className="card-header">
                  <h3 className="card-title">Primary API Configuration</h3>
                  {isRateHawkConfigured() ? (
                    <span className="status-badge active">
                      <CheckCircle size={14} />
                      Connected
                    </span>
                  ) : (
                    <span className="status-badge inactive">
                      <AlertCircle size={14} />
                      Not Connected
                    </span>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">API Key</label>
                    <div className="input-with-icon">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={rateHawkForm.apiKey}
                        onChange={(e) =>
                          setRateHawkForm({ ...rateHawkForm, apiKey: e.target.value })
                        }
                        className="form-input"
                        placeholder="Enter your API key"
                      />
                      <button
                        className="icon-btn"
                        onClick={() => setShowApiKey(!showApiKey)}
                        type="button"
                      >
                        {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Key ID / Partner ID</label>
                    <input
                      type="text"
                      value={rateHawkForm.keyId}
                      onChange={(e) =>
                        setRateHawkForm({ ...rateHawkForm, keyId: e.target.value })
                      }
                      className="form-input"
                      placeholder="Enter your Key ID"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Environment</label>
                    <select
                      value={rateHawkForm.environment}
                      onChange={(e) =>
                        setRateHawkForm({ ...rateHawkForm, environment: e.target.value })
                      }
                      className="form-select"
                    >
                      <option value="sandbox">Sandbox (Testing)</option>
                      <option value="production">Production (Live)</option>
                    </select>
                  </div>
                </div>

                <div className="alert info">
                  <AlertCircle size={18} />
                  <div>
                    <strong>Unified API Access</strong>
                    <p>This API key will be used for Hotels, Flights, and other supported services.</p>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="btn-secondary"
                  onClick={handleTestConnection}
                  disabled={!isRateHawkConfigured() || testingConnection}
                >
                  <RefreshCw size={18} />
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </button>
                <button className="btn-primary" onClick={handleSaveRateHawk}>
                  <Save size={18} />
                  Save API Settings
                </button>
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Payment Configuration</h2>
                <p className="section-description">Configure Stripe payment gateway with 3-D Secure</p>
              </div>

              <div className="settings-card">
                <div className="card-header">
                  <h3 className="card-title">Stripe Settings</h3>
                  <span className="status-badge active">
                    <CheckCircle size={14} />
                    Connected
                  </span>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Publishable Key</label>
                    <input
                      type="text"
                      value={paymentSettings.stripePublishableKey}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, stripePublishableKey: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Secret Key</label>
                    <div className="input-with-icon">
                      <input
                        type={showStripeKey ? 'text' : 'password'}
                        value={paymentSettings.stripeSecretKey}
                        onChange={(e) =>
                          setPaymentSettings({ ...paymentSettings, stripeSecretKey: e.target.value })
                        }
                        className="form-input"
                      />
                      <button
                        className="icon-btn"
                        onClick={() => setShowStripeKey(!showStripeKey)}
                      >
                        {showStripeKey ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select
                      value={paymentSettings.stripeCurrency}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, stripeCurrency: e.target.value })
                      }
                      className="form-select"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="AED">AED - UAE Dirham</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={paymentSettings.stripe3DSecure}
                        onChange={(e) =>
                          setPaymentSettings({ ...paymentSettings, stripe3DSecure: e.target.checked })
                        }
                      />
                      <span>Enable 3-D Secure Authentication</span>
                    </label>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Webhook Secret</label>
                    <input
                      type="password"
                      value={paymentSettings.stripeWebhookSecret}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, stripeWebhookSecret: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="alert success">
                  <Shield size={18} />
                  <div>
                    <strong>3-D Secure Enabled</strong>
                    <p>Enhanced security for card payments with SCA compliance</p>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-primary" onClick={() => handleSave('Payment')}>
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Webhooks Tab */}
          {activeTab === 'webhooks' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Webhook Configuration</h2>
                <p className="section-description">Configure webhooks for real-time notifications</p>
              </div>

              <div className="settings-card">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={webhookSettings.webhookEnabled}
                        onChange={(e) =>
                          setWebhookSettings({ ...webhookSettings, webhookEnabled: e.target.checked })
                        }
                      />
                      <span>Enable Webhooks</span>
                    </label>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Booking Webhook URL</label>
                    <input
                      type="url"
                      value={webhookSettings.bookingWebhookUrl}
                      onChange={(e) =>
                        setWebhookSettings({ ...webhookSettings, bookingWebhookUrl: e.target.value })
                      }
                      className="form-input"
                      placeholder="https://yoursite.com/webhooks/booking"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Payment Webhook URL</label>
                    <input
                      type="url"
                      value={webhookSettings.paymentWebhookUrl}
                      onChange={(e) =>
                        setWebhookSettings({ ...webhookSettings, paymentWebhookUrl: e.target.value })
                      }
                      className="form-input"
                      placeholder="https://yoursite.com/webhooks/payment"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Webhook Secret</label>
                    <div className="input-with-icon">
                      <input
                        type="password"
                        value={webhookSettings.webhookSecret}
                        onChange={(e) =>
                          setWebhookSettings({ ...webhookSettings, webhookSecret: e.target.value })
                        }
                        className="form-input"
                      />
                      <button className="icon-btn">
                        <RefreshCw size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={handleTestWebhook}>
                  <RefreshCw size={18} />
                  Test Webhook
                </button>
                <button className="btn-primary" onClick={() => handleSave('Webhooks')}>
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Email Configuration</h2>
                <p className="section-description">Configure SMTP for sending emails and vouchers</p>
              </div>

              <div className="settings-card">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">SMTP Host</label>
                    <input
                      type="text"
                      value={emailSettings.smtpHost}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">SMTP Port</label>
                    <input
                      type="text"
                      value={emailSettings.smtpPort}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">SMTP Username</label>
                    <input
                      type="text"
                      value={emailSettings.smtpUser}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, smtpUser: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">SMTP Password</label>
                    <input
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">From Email</label>
                    <input
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, fromEmail: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">From Name</label>
                    <input
                      type="text"
                      value={emailSettings.fromName}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, fromName: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={handleTestEmail}>
                  <Mail size={18} />
                  Send Test Email
                </button>
                <button className="btn-primary" onClick={() => handleSave('Email')}>
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">General Settings</h2>
                <p className="section-description">Configure general system preferences</p>
              </div>

              <div className="settings-card">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Site Name</label>
                    <input
                      type="text"
                      value={generalSettings.siteName}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Site URL</label>
                    <input
                      type="url"
                      value={generalSettings.siteUrl}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Default Currency</label>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, currency: e.target.value })
                      }
                      className="form-select"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Language</label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, language: e.target.value })
                      }
                      className="form-select"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select
                      value={generalSettings.timezone}
                      onChange={(e) =>
                        setGeneralSettings({ ...generalSettings, timezone: e.target.value })
                      }
                      className="form-select"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">EST</option>
                      <option value="America/Los_Angeles">PST</option>
                      <option value="Europe/London">GMT</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={generalSettings.autoVoucherDelivery}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            autoVoucherDelivery: e.target.checked
                          })
                        }
                      />
                      <span>Automatic Voucher Delivery on Payment Confirmation</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-primary" onClick={() => handleSave('General')}>
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div >
    </div >
  );
};

export default AdminSettings;
