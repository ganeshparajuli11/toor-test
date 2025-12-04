import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ratehawkService from '../services/ratehawk.service';
import api from '../services/api.service';

const ApiSettingsContext = createContext();

/**
 * API Settings Context Provider
 * Manages API credentials via backend
 */
export const ApiSettingsProvider = ({ children }) => {
  const [apiSettings, setApiSettings] = useState({
    ratehawk: {
      apiKey: '',
      partnerId: '',
      environment: 'sandbox',
      initialized: false
    },
    stripe: {
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
      initialized: false
    }
  });

  const [loading, setLoading] = useState(true);

  /**
   * Load API settings from backend on mount
   */
  useEffect(() => {
    loadApiSettings();
  }, []);

  /**
   * Load API settings from backend
   */
  const loadApiSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      const settings = response.data;

      // Determine initialization status based on presence of keys
      const ratehawkInitialized = !!settings.ratehawk?.apiKey;
      const stripeInitialized = !!settings.stripe?.publishableKey;

      setApiSettings({
        ratehawk: { ...settings.ratehawk, initialized: ratehawkInitialized },
        stripe: { ...settings.stripe, initialized: stripeInitialized }
      });
    } catch (error) {
      console.error('Error loading API settings:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save API settings to backend
   */
  const saveApiSettings = useCallback(async (settings) => {
    try {
      const response = await api.post('/admin/settings', settings);
      const updatedSettings = response.data.settings;

      const ratehawkInitialized = !!updatedSettings.ratehawk?.apiKey;
      const stripeInitialized = !!updatedSettings.stripe?.publishableKey;

      setApiSettings({
        ratehawk: { ...updatedSettings.ratehawk, initialized: ratehawkInitialized },
        stripe: { ...updatedSettings.stripe, initialized: stripeInitialized }
      });

      return { success: true, message: 'Settings saved successfully' };
    } catch (error) {
      console.error('Error saving API settings:', error);
      return { success: false, message: error.message };
    }
  }, []);

  /**
   * Test RateHawk API connection
   */
  const testRateHawkConnection = async () => {
    try {
      const result = await ratehawkService.testConnection();
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  /**
   * Update RateHawk settings
   */
  const updateRateHawkSettings = useCallback((settings) => {
    return saveApiSettings({ ratehawk: settings });
  }, [saveApiSettings]);

  /**
   * Update Stripe settings
   */
  const updateStripeSettings = useCallback((settings) => {
    return saveApiSettings({ stripe: settings });
  }, [saveApiSettings]);

  /**
   * Get RateHawk service instance
   */
  const getRateHawkService = () => {
    // Service is stateless now, but we check if configured
    if (!apiSettings.ratehawk.initialized) {
      console.warn('RateHawk API key not configured in settings');
    }
    return ratehawkService;
  };

  /**
   * Check if RateHawk is configured
   */
  const isRateHawkConfigured = () => {
    return apiSettings.ratehawk.initialized;
  };

  /**
   * Check if Stripe is configured
   */
  const isStripeConfigured = () => {
    return apiSettings.stripe.initialized;
  };

  /**
   * Clear all API settings (Reset to defaults)
   */
  const clearApiSettings = async () => {
    // In a real app, this might delete from backend or reset to empty strings
    // For now we just reset local state to show it's "cleared" in UI
    // but typically we'd want to call an API to clear them.
    // Let's just save empty strings.
    await saveApiSettings({
      ratehawk: { apiKey: '', partnerId: '', environment: 'sandbox' },
      stripe: { publishableKey: '', secretKey: '', webhookSecret: '' }
    });
  };

  const value = {
    apiSettings,
    loading,
    saveApiSettings,
    updateRateHawkSettings,
    updateStripeSettings,
    testRateHawkConnection,
    getRateHawkService,
    isRateHawkConfigured,
    isStripeConfigured,
    clearApiSettings
  };

  return (
    <ApiSettingsContext.Provider value={value}>
      {children}
    </ApiSettingsContext.Provider>
  );
};

/**
 * Hook to use API settings context
 */
export const useApiSettings = () => {
  const context = useContext(ApiSettingsContext);
  if (!context) {
    throw new Error('useApiSettings must be used within ApiSettingsProvider');
  }
  return context;
};

export default ApiSettingsContext;
