import React, { useState, useEffect } from 'react';
import { getSettings } from '../api/settings';
import { formatPrice, formatCompactPrice } from '../utils/priceUtils';
import { CurrencyContext } from './CurrencyContext';

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('Nigerian Naira (NGN)');
  const [loading, setLoading] = useState(true);

  const fetchCurrency = async () => {
    try {
      const data = await getSettings('store_settings');
      if (data?.currency) {
        setCurrency(data.currency);
      }
    } catch (error) {
      console.error("Failed to load store currency:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrency();
  }, []);

  const value = {
    currency,
    setCurrency,
    formatPrice: (amount) => formatPrice(amount, currency),
    formatCompactPrice: (amount) => formatCompactPrice(amount, currency),
    loading
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
