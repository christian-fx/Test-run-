/**
 * Date Utility Engine for Analytics
 */

/**
 * Get the start date for the current period
 * @param {number} days - Number of days in the range (e.g., 7, 30, 90)
 * @returns {Date}
 */
export const getRangeStart = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Get the start date for the previous (comparison) period
 * @param {number} days - Number of days in the current range
 * @returns {Date} - Returns a date 2N days ago
 */
export const getPrevRangeStart = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - (days * 2));
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Helper to check if a date string/timestamp is within a given range
 * @param {string|number|Date} date - The date to check
 * @param {Date} start - Start of range
 * @param {Date} end - End of range (optional, defaults to now)
 * @returns {boolean}
 */
export const isWithinRange = (date, start, end = new Date()) => {
  if (!date) return false;
  const d = new Date(date?.toDate ? date.toDate() : date);
  return d >= start && d <= end;
};

/**
 * Relative time formatter (e.g., "5m ago", "2h ago", "Dec 12")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '—';
  const d = new Date(date?.toDate ? date.toDate() : date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};
