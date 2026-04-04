/**
 * Price Utility Engine
 */

const CURRENCY_MAP = {
  'United States Dollar (USD)': { symbol: '$', code: 'USD', rate: 1/1500 },
  'Euro (EUR)': { symbol: '€', code: 'EUR', rate: 1/1600 },
  'British Pound (GBP)': { symbol: '£', code: 'GBP', rate: 1/1900 },
  'Japanese Yen (JPY)': { symbol: '¥', code: 'JPY', rate: 1/10 },
  'Nigerian Naira (NGN)': { symbol: '₦', code: 'NGN', rate: 1 }
};

/**
 * Format a price based on the current currency setting
 * @param {number} amount - Amount in base currency (NGN)
 * @param {string} currencyName - Full name of the currency from settings
 * @returns {string} - Formatted price string
 */
export const formatPrice = (amount, currencyName = 'Nigerian Naira (NGN)') => {
  if (amount === undefined || amount === null || amount === '') return '—';
  
  // Robustly handle strings with symbols or commas (e.g. "₦1,200")
  let cleanAmount = amount;
  if (typeof amount === 'string') {
    cleanAmount = parseFloat(amount.replace(/[^0-9.-]/g, ''));
  }

  if (isNaN(cleanAmount)) return '—';

  const config = CURRENCY_MAP[currencyName] || CURRENCY_MAP['Nigerian Naira (NGN)'];
  const convertedAmount = cleanAmount * config.rate;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.code === 'NGN' ? 0 : 2,
    maximumFractionDigits: config.code === 'NGN' ? 0 : 2,
  }).format(convertedAmount).replace(config.code, config.symbol);
};

/**
 * Shorthand formatter for charts (K, M, B)
 * @param {number} value - Amount in base currency (NGN)
 * @param {string} currencyName - Full name of the currency
 */
export const formatCompactPrice = (value, currencyName = 'Nigerian Naira (NGN)') => {
  const config = CURRENCY_MAP[currencyName] || CURRENCY_MAP['Nigerian Naira (NGN)'];
  const converted = value * config.rate;

  if (converted >= 1_000_000) return `${config.symbol}${(converted / 1_000_000).toFixed(1)}M`;
  if (converted >= 1_000) return `${config.symbol}${(converted / 1_000).toFixed(0)}K`;
  
  return `${config.symbol}${Math.round(converted)}`;
};

export { CURRENCY_MAP };
