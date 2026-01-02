/**
 * Currency formatting utility using Intl.NumberFormat
 */

/**
 * Default currency code
 */
const DEFAULT_CURRENCY = 'INR';

/**
 * Default locale for formatting
 */
const DEFAULT_LOCALE = 'en-IN';

/**
 * Currency formatter instance
 */
const currencyFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
  style: 'currency',
  currency: DEFAULT_CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format a number as currency (INR by default)
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₹1,234.56")
 * 
 * @example
 * formatCurrency(1234.56) // "₹1,234.56"
 * formatCurrency(1000) // "₹1,000.00"
 * formatCurrency(0) // "₹0.00"
 */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

/**
 * Format a number as currency with a custom currency code
 * @param amount - The amount to format
 * @param currencyCode - ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
 * @param locale - Optional locale for formatting (defaults to 'en-IN')
 * @returns Formatted currency string
 * 
 * @example
 * formatCurrencyWithCode(1234.56, 'USD') // "$1,234.56"
 * formatCurrencyWithCode(1234.56, 'EUR', 'de-DE') // "1.234,56 €"
 */
export function formatCurrencyWithCode(
  amount: number,
  currencyCode: string,
  locale: string = DEFAULT_LOCALE
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * Format a number as currency without the currency symbol
 * @param amount - The amount to format
 * @returns Formatted number string (e.g., "1,234.56")
 * 
 * @example
 * formatAmount(1234.56) // "1,234.56"
 * formatAmount(1000) // "1,000.00"
 */
export function formatAmount(amount: number): string {
  const formatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * Format a number as compact currency (e.g., ₹1.2K, ₹1.5M)
 * @param amount - The amount to format
 * @returns Compact formatted currency string
 * 
 * @example
 * formatCompactCurrency(1234) // "₹1.2K"
 * formatCompactCurrency(1500000) // "₹1.5M"
 * formatCompactCurrency(500) // "₹500"
 */
export function formatCompactCurrency(amount: number): string {
  const compactFormatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  return compactFormatter.format(amount);
}

/**
 * Parse a formatted currency string back to a number
 * @param currencyString - The formatted currency string
 * @returns Parsed number or NaN if parsing fails
 * 
 * @example
 * parseCurrency("₹1,234.56") // 1234.56
 * parseCurrency("1,234.56") // 1234.56
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols, spaces, and commas
  const cleanedString = currencyString.replace(/[₹$€£,\s]/g, '');
  return parseFloat(cleanedString);
}

/**
 * Get the currency symbol for the default currency
 * @returns Currency symbol (e.g., "₹")
 */
export function getCurrencySymbol(): string {
  return currencyFormatter.formatToParts(0)
    .find(part => part.type === 'currency')?.value || DEFAULT_CURRENCY;
}

/**
 * Export default currency code
 */
export { DEFAULT_CURRENCY, DEFAULT_LOCALE };
