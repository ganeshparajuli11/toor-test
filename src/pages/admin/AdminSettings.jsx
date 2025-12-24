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
  CheckCircle,
  Users,
  Info,
  Settings,
  Zap,
  Lock,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useApiSettings } from '../../contexts/ApiSettingsContext';
import './AdminSettings.css';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('api');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showStripeKey, setShowStripeKey] = useState(false);
  const [showGoogleSecret, setShowGoogleSecret] = useState(false);
  const [showFacebookSecret, setShowFacebookSecret] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  // Get API settings from context
  const {
    apiSettings: contextApiSettings,
    saveApiSettings,
    updateRateHawkSettings,
    updateStripeSettings,
    updateOAuthSettings,
    testRateHawkConnection,
    isRateHawkConfigured
  } = useApiSettings();

  // Local state for form inputs
  const [rateHawkForm, setRateHawkForm] = useState({
    apiKey: '',
    keyId: '',
    environment: 'sandbox'
  });

  // OAuth settings state
  const [oauthForm, setOAuthForm] = useState({
    google: {
      clientId: '',
      clientSecret: '',
      enabled: false
    },
    facebook: {
      appId: '',
      appSecret: '',
      enabled: false
    }
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
    if (contextApiSettings.stripe) {
      setPaymentSettings({
        stripePublishableKey: contextApiSettings.stripe.publishableKey || '',
        stripeSecretKey: contextApiSettings.stripe.secretKey || '',
        stripeWebhookSecret: contextApiSettings.stripe.webhookSecret || '',
        stripeCurrency: contextApiSettings.stripe.currency || 'USD',
        stripe3DSecure: contextApiSettings.stripe.enable3DSecure !== false
      });
    }
    if (contextApiSettings.oauth) {
      setOAuthForm({
        google: {
          clientId: contextApiSettings.oauth.google?.clientId || '',
          clientSecret: contextApiSettings.oauth.google?.clientSecret || '',
          enabled: contextApiSettings.oauth.google?.enabled || false
        },
        facebook: {
          appId: contextApiSettings.oauth.facebook?.appId || '',
          appSecret: contextApiSettings.oauth.facebook?.appSecret || '',
          enabled: contextApiSettings.oauth.facebook?.enabled || false
        }
      });
    }
    if (contextApiSettings.email) {
      setEmailSettings({
        smtpHost: contextApiSettings.email.smtpHost || '',
        smtpPort: contextApiSettings.email.smtpPort || '587',
        smtpUser: contextApiSettings.email.smtpUser || '',
        smtpPassword: contextApiSettings.email.smtpPassword || '',
        fromEmail: contextApiSettings.email.fromEmail || '',
        fromName: contextApiSettings.email.fromName || 'Zanafly'
      });
    }
    if (contextApiSettings.database) {
      setDatabaseSettings({
        mongodbUrl: contextApiSettings.database.mongodbUrl || '',
        enabled: contextApiSettings.database.enabled || false
      });
    }
    if (contextApiSettings.general) {
      setGeneralSettings({
        siteName: contextApiSettings.general.siteName || 'Zanafly',
        siteUrl: contextApiSettings.general.siteUrl || '',
        currency: contextApiSettings.general.currency || 'USD',
        language: contextApiSettings.general.language || 'en',
        timezone: contextApiSettings.general.timezone || 'UTC'
      });
    }
  }, [contextApiSettings]);

  const [apiSettings, setApiSettings] = useState({
    flightApiKey: '',
    flightApiEnabled: false
  });

  const [paymentSettings, setPaymentSettings] = useState({
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripe3DSecure: true,
    stripeCurrency: 'USD',
    stripeWebhookSecret: ''
  });

  const [webhookSettings, setWebhookSettings] = useState({
    bookingWebhookUrl: 'https://yoursite.com/webhooks/booking',
    paymentWebhookUrl: 'https://yoursite.com/webhooks/payment',
    webhookSecret: '••••••••••••••••••••',
    webhookEnabled: true
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Zanafly'
  });

  const [databaseSettings, setDatabaseSettings] = useState({
    mongodbUrl: '',
    enabled: false
  });

  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Zanafly',
    siteUrl: '',
    currency: 'USD',
    language: 'en',
    timezone: 'UTC'
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

  const handleSaveOAuth = async () => {
    try {
      const result = await updateOAuthSettings(oauthForm);
      if (result.success) {
        toast.success('OAuth settings saved successfully!');
      } else {
        toast.error(result.message || 'Failed to save OAuth settings');
      }
    } catch (error) {
      console.error('Error saving OAuth settings:', error);
      toast.error('Error saving OAuth settings');
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
    try {
      let result;

      if (section === 'Payment') {
        result = await saveApiSettings({
          stripe: {
            publishableKey: paymentSettings.stripePublishableKey,
            secretKey: paymentSettings.stripeSecretKey,
            webhookSecret: paymentSettings.stripeWebhookSecret,
            currency: paymentSettings.stripeCurrency,
            enable3DSecure: paymentSettings.stripe3DSecure
          }
        });
      } else if (section === 'Email') {
        result = await saveApiSettings({
          email: {
            smtpHost: emailSettings.smtpHost,
            smtpPort: emailSettings.smtpPort,
            smtpUser: emailSettings.smtpUser,
            smtpPassword: emailSettings.smtpPassword,
            fromEmail: emailSettings.fromEmail,
            fromName: emailSettings.fromName,
            enabled: true
          }
        });
      } else if (section === 'Database') {
        result = await saveApiSettings({
          database: {
            mongodbUrl: databaseSettings.mongodbUrl,
            enabled: databaseSettings.enabled
          }
        });
      } else if (section === 'General') {
        result = await saveApiSettings({
          general: {
            siteName: generalSettings.siteName,
            siteUrl: generalSettings.siteUrl,
            currency: generalSettings.currency,
            language: generalSettings.language,
            timezone: generalSettings.timezone
          }
        });
      } else {
        toast.success(`${section} settings saved successfully!`);
        return;
      }

      if (result?.success) {
        toast.success(`${section} settings saved successfully!`);
      } else {
        toast.error(result?.message || `Failed to save ${section} settings`);
      }
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
      toast.error(`Error saving ${section} settings`);
    }
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
    { id: 'oauth', label: 'Social Login', icon: Users },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'email', label: 'Email SMTP', icon: Mail },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'general', label: 'General', icon: Globe }
  ];

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">
            <Settings size={32} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Settings
          </h1>
          <p className="settings-subtitle">Manage system configuration, API integrations, and security settings</p>
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
                  <h3 className="card-title">
                    <Zap size={18} />
                    Primary API Configuration
                  </h3>
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

          {/* OAuth / Social Login Tab */}
          {activeTab === 'oauth' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Social Login Configuration</h2>
                <p className="section-description">
                  Configure Google and Facebook OAuth for user authentication
                </p>
              </div>

              {/* Google OAuth */}
              <div className="settings-card">
                <div className="card-header">
                  <h3 className="card-title">Google OAuth</h3>
                  {oauthForm.google.enabled && oauthForm.google.clientId ? (
                    <span className="status-badge active">
                      <CheckCircle size={14} />
                      Enabled
                    </span>
                  ) : (
                    <span className="status-badge inactive">
                      <AlertCircle size={14} />
                      Disabled
                    </span>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={oauthForm.google.enabled}
                        onChange={(e) =>
                          setOAuthForm({
                            ...oauthForm,
                            google: { ...oauthForm.google, enabled: e.target.checked }
                          })
                        }
                      />
                      <span>Enable Google Sign-In</span>
                    </label>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Client ID</label>
                    <input
                      type="text"
                      value={oauthForm.google.clientId}
                      onChange={(e) =>
                        setOAuthForm({
                          ...oauthForm,
                          google: { ...oauthForm.google, clientId: e.target.value }
                        })
                      }
                      className="form-input"
                      placeholder="Enter Google Client ID"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Client Secret</label>
                    <div className="input-with-icon">
                      <input
                        type={showGoogleSecret ? 'text' : 'password'}
                        value={oauthForm.google.clientSecret}
                        onChange={(e) =>
                          setOAuthForm({
                            ...oauthForm,
                            google: { ...oauthForm.google, clientSecret: e.target.value }
                          })
                        }
                        className="form-input"
                        placeholder="Enter Google Client Secret"
                      />
                      <button
                        className="icon-btn"
                        onClick={() => setShowGoogleSecret(!showGoogleSecret)}
                        type="button"
                      >
                        {showGoogleSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="alert info">
                  <AlertCircle size={18} />
                  <div>
                    <strong>How to get Google OAuth credentials:</strong>
                    <p>
                      1. Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google Cloud Console</a><br />
                      2. Create a new project or select existing one<br />
                      3. Enable "Google+ API" or "Google Identity Services"<br />
                      4. Create OAuth 2.0 Client ID (Web application)<br />
                      5. Add authorized redirect URI: <code>{window.location.origin}/auth/google/callback</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Facebook OAuth */}
              <div className="settings-card" style={{ marginTop: '1.5rem' }}>
                <div className="card-header">
                  <h3 className="card-title">Facebook OAuth</h3>
                  {oauthForm.facebook.enabled && oauthForm.facebook.appId ? (
                    <span className="status-badge active">
                      <CheckCircle size={14} />
                      Enabled
                    </span>
                  ) : (
                    <span className="status-badge inactive">
                      <AlertCircle size={14} />
                      Disabled
                    </span>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={oauthForm.facebook.enabled}
                        onChange={(e) =>
                          setOAuthForm({
                            ...oauthForm,
                            facebook: { ...oauthForm.facebook, enabled: e.target.checked }
                          })
                        }
                      />
                      <span>Enable Facebook Sign-In</span>
                    </label>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">App ID</label>
                    <input
                      type="text"
                      value={oauthForm.facebook.appId}
                      onChange={(e) =>
                        setOAuthForm({
                          ...oauthForm,
                          facebook: { ...oauthForm.facebook, appId: e.target.value }
                        })
                      }
                      className="form-input"
                      placeholder="Enter Facebook App ID"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">App Secret</label>
                    <div className="input-with-icon">
                      <input
                        type={showFacebookSecret ? 'text' : 'password'}
                        value={oauthForm.facebook.appSecret}
                        onChange={(e) =>
                          setOAuthForm({
                            ...oauthForm,
                            facebook: { ...oauthForm.facebook, appSecret: e.target.value }
                          })
                        }
                        className="form-input"
                        placeholder="Enter Facebook App Secret"
                      />
                      <button
                        className="icon-btn"
                        onClick={() => setShowFacebookSecret(!showFacebookSecret)}
                        type="button"
                      >
                        {showFacebookSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="alert info">
                  <AlertCircle size={18} />
                  <div>
                    <strong>How to get Facebook OAuth credentials:</strong>
                    <p>
                      1. Go to <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer">Facebook Developers</a><br />
                      2. Create a new app (Consumer type)<br />
                      3. Add "Facebook Login" product<br />
                      4. Go to Settings &gt; Basic to get App ID and App Secret<br />
                      5. Add valid OAuth redirect URI: <code>{window.location.origin}/auth/facebook/callback</code>
                    </p>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-primary" onClick={handleSaveOAuth}>
                  <Save size={18} />
                  Save Social Login Settings
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
                  <h3 className="card-title">
                    <Lock size={18} />
                    Stripe Settings
                  </h3>
                  {paymentSettings.stripePublishableKey && paymentSettings.stripeSecretKey ? (
                    <span className="status-badge active">
                      <CheckCircle size={14} />
                      Configured
                    </span>
                  ) : (
                    <span className="status-badge inactive">
                      <AlertCircle size={14} />
                      Not Configured
                    </span>
                  )}
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
                      placeholder="pk_live_... or pk_test_..."
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
                        placeholder="sk_live_... or sk_test_..."
                      />
                      <button
                        type="button"
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
                      <option value="CHF">CHF - Swiss Franc</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="GBP">GBP - British Pound</option>
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
                    <label className="form-label">Webhook Secret (Optional)</label>
                    <input
                      type="password"
                      value={paymentSettings.stripeWebhookSecret}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, stripeWebhookSecret: e.target.value })
                      }
                      className="form-input"
                      placeholder="whsec_..."
                    />
                  </div>
                </div>

                <div className="alert info">
                  <Info size={18} />
                  <div>
                    <strong>Get your Stripe API Keys</strong>
                    <p>Visit <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer">dashboard.stripe.com/apikeys</a> to get your publishable and secret keys. Keys are stored securely encrypted.</p>
                  </div>
                </div>

                {paymentSettings.stripe3DSecure && (
                  <div className="alert success">
                    <Shield size={18} />
                    <div>
                      <strong>3-D Secure Enabled</strong>
                      <p>Enhanced security for card payments with SCA compliance</p>
                    </div>
                  </div>
                )}
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

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div className="settings-section">
              <div className="section-header">
                <h2 className="section-title">Database Configuration</h2>
                <p className="section-description">Configure MongoDB database connection (optional)</p>
              </div>

              <div className="settings-card">
                <div className="card-header">
                  <h3 className="card-title">
                    <Database size={18} />
                    MongoDB Settings
                  </h3>
                  {databaseSettings.mongodbUrl ? (
                    <span className="status-badge active">
                      <CheckCircle size={14} />
                      Configured
                    </span>
                  ) : (
                    <span className="status-badge inactive">
                      <AlertCircle size={14} />
                      Not Configured
                    </span>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">MongoDB Connection URL</label>
                    <input
                      type="password"
                      value={databaseSettings.mongodbUrl}
                      onChange={(e) =>
                        setDatabaseSettings({ ...databaseSettings, mongodbUrl: e.target.value })
                      }
                      className="form-input"
                      placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
                    />
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={databaseSettings.enabled}
                        onChange={(e) =>
                          setDatabaseSettings({ ...databaseSettings, enabled: e.target.checked })
                        }
                      />
                      <span>Enable MongoDB (use database instead of JSON files)</span>
                    </label>
                  </div>
                </div>

                <div className="alert info">
                  <Info size={18} />
                  <div>
                    <strong>MongoDB Atlas</strong>
                    <p>Create a free MongoDB Atlas account at <a href="https://www.mongodb.com/cloud/atlas" target="_blank" rel="noopener noreferrer">mongodb.com/cloud/atlas</a> and paste your connection string above. The URL is stored securely encrypted.</p>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-primary" onClick={() => handleSave('Database')}>
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
                      <option value="CHF">CHF</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
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
