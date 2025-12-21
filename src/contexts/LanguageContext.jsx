import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

// Custom hook to use translation
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Shorthand hook for just the translation function
export const useTranslation = () => {
  const { t, language } = useLanguage();
  return { t, language };
};

export const LanguageProvider = ({ children }) => {
  // Initialize from localStorage or browser language
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('zanafly_language');
    if (saved && translations[saved]) {
      return saved;
    }
    // Try to detect browser language
    const browserLang = navigator.language?.split('-')[0]?.toUpperCase();
    if (browserLang && translations[browserLang]) {
      return browserLang;
    }
    return 'EN';
  });

  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('zanafly_currency') || 'USD';
  });

  // Persist language changes
  const setLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('zanafly_language', lang);
      // Update HTML lang attribute for accessibility
      document.documentElement.lang = lang.toLowerCase();
    }
  }, []);

  // Persist currency changes
  const setCurrency = useCallback((curr) => {
    setCurrencyState(curr);
    localStorage.setItem('zanafly_currency', curr);
  }, []);

  // Translation function with fallback
  const t = useCallback((key) => {
    // Return translated text or fall back to English, then key itself
    return translations[language]?.[key] || translations['EN']?.[key] || key;
  }, [language]);

  // Format currency
  const formatCurrency = useCallback((amount, currencyCode = currency) => {
    const currencyFormats = {
      USD: { symbol: '$', position: 'before', decimals: 2 },
      EUR: { symbol: '€', position: 'after', decimals: 2 },
      GBP: { symbol: '£', position: 'before', decimals: 2 },
      CHF: { symbol: 'CHF', position: 'before', decimals: 2 },
    };

    const format = currencyFormats[currencyCode] || currencyFormats.USD;
    const formattedAmount = Number(amount).toFixed(format.decimals);

    if (format.position === 'before') {
      return `${format.symbol}${formattedAmount}`;
    }
    return `${formattedAmount} ${format.symbol}`;
  }, [currency]);

  // Set HTML lang attribute on mount
  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
  }, [language]);

  const value = {
    language,
    currency,
    setLanguage,
    setCurrency,
    t,
    formatCurrency,
    availableLanguages: Object.keys(translations),
    translations,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
