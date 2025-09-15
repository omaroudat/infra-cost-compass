// Utility functions for consistent number formatting across the application

/**
 * Rounds a number to exactly 2 decimal places
 */
export const roundToTwoDecimals = (num: number): number => {
  return Math.round(num * 100) / 100;
};

/**
 * Creates a currency formatter with SAR currency and 2 decimal places
 */
export const createCurrencyFormatter = (locale: string = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

/**
 * Creates a number formatter with 2 decimal places (no currency symbol)
 */
export const createNumberFormatter = (locale: string = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

/**
 * Formats a number as currency with exactly 2 decimal places
 */
export const formatCurrency = (value: number, locale: string = 'en-US'): string => {
  const formatter = createCurrencyFormatter(locale);
  return formatter.format(roundToTwoDecimals(value));
};

/**
 * Formats a number with exactly 2 decimal places (no currency symbol)
 */
export const formatNumber = (value: number, locale: string = 'en-US'): string => {
  const formatter = createNumberFormatter(locale);
  return formatter.format(roundToTwoDecimals(value));
};

/**
 * Formats a percentage with exactly 1 decimal place
 */
export const formatPercentage = (value: number): string => {
  return `${(Math.round(value * 10) / 10).toFixed(1)}%`;
};