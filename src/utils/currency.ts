/**
 * Currency formatting utility using Intl.NumberFormat
 */

import { storage } from "./storage";

/**
 * Default currency code
 */
const DEFAULT_CURRENCY = "INR";

/**
 * Default locale for formatting
 */
const DEFAULT_LOCALE = "en-IN";

/**
 * Currency information map
 */
const CURRENCY_INFO: { [key: string]: { symbol: string; locale: string } } = {
    INR: { symbol: "₹", locale: "en-IN" },
    USD: { symbol: "$", locale: "en-US" },
    EUR: { symbol: "€", locale: "de-DE" },
    GBP: { symbol: "£", locale: "en-GB" },
    JPY: { symbol: "¥", locale: "ja-JP" },
    AUD: { symbol: "A$", locale: "en-AU" },
    CAD: { symbol: "C$", locale: "en-CA" },
};

/**
 * Get current currency from settings
 */
export async function getCurrentCurrency(): Promise<string> {
    try {
        const settings = await storage.getData<{ currency: string }>(
            "settings"
        );
        return settings?.currency || DEFAULT_CURRENCY;
    } catch {
        return DEFAULT_CURRENCY;
    }
}

/**
 * Get currency info (symbol and locale)
 */
export function getCurrencyInfo(currencyCode: string = DEFAULT_CURRENCY): {
    symbol: string;
    locale: string;
} {
    return CURRENCY_INFO[currencyCode] || CURRENCY_INFO[DEFAULT_CURRENCY];
}

/**
 * Format a number as currency using current settings
 * @param amount - The amount to format
 * @param currencyCode - Optional currency code (if not provided, uses settings)
 * @returns Formatted currency string
 */
export async function formatCurrency(
    amount: number,
    currencyCode?: string
): Promise<string> {
    const currency = currencyCode || (await getCurrentCurrency());
    const info = getCurrencyInfo(currency);

    const formatter = new Intl.NumberFormat(info.locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return formatter.format(amount);
}

/**
 * Format currency synchronously (uses provided currency or default)
 * Use this when you already know the currency code
 */
export function formatCurrencySync(
    amount: number,
    currencyCode: string = DEFAULT_CURRENCY
): string {
    const info = getCurrencyInfo(currencyCode);

    const formatter = new Intl.NumberFormat(info.locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return formatter.format(amount);
}

/**
 * Format a number as currency with a custom currency code
 * @param amount - The amount to format
 * @param currencyCode - ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
 * @param locale - Optional locale for formatting
 * @returns Formatted currency string
 */
export function formatCurrencyWithCode(
    amount: number,
    currencyCode: string,
    locale?: string
): string {
    const info = getCurrencyInfo(currencyCode);
    const useLocale = locale || info.locale;

    const formatter = new Intl.NumberFormat(useLocale, {
        style: "currency",
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
 */
export function formatAmount(amount: number): string {
    const formatter = new Intl.NumberFormat(DEFAULT_LOCALE, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return formatter.format(amount);
}

/**
 * Format a number as compact currency
 * @param amount - The amount to format
 * @param currencyCode - Optional currency code
 * @returns Compact formatted currency string
 */
export function formatCompactCurrency(
    amount: number,
    currencyCode: string = DEFAULT_CURRENCY
): string {
    const info = getCurrencyInfo(currencyCode);

    const compactFormatter = new Intl.NumberFormat(info.locale, {
        style: "currency",
        currency: currencyCode,
        notation: "compact",
        maximumFractionDigits: 1,
    });
    return compactFormatter.format(amount);
}

/**
 * Parse a formatted currency string back to a number
 * @param currencyString - The formatted currency string
 * @returns Parsed number or NaN if parsing fails
 */
export function parseCurrency(currencyString: string): number {
    // Remove currency symbols, spaces, and commas
    const cleanedString = currencyString.replace(/[₹$€£¥A-Z,\s]/g, "");
    return parseFloat(cleanedString);
}

/**
 * Get the currency symbol for a currency code
 * @param currencyCode - Optional currency code (defaults to INR)
 * @returns Currency symbol
 */
export function getCurrencySymbol(
    currencyCode: string = DEFAULT_CURRENCY
): string {
    return getCurrencyInfo(currencyCode).symbol;
}

/**
 * Get currency symbol from settings (async)
 */
export async function getCurrentCurrencySymbol(): Promise<string> {
    const currency = await getCurrentCurrency();
    return getCurrencySymbol(currency);
}

/**
 * Export default currency code
 */
export { DEFAULT_CURRENCY, DEFAULT_LOCALE };
