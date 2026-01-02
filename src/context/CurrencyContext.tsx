import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DEFAULT_CURRENCY, getCurrencyInfo } from '../utils/currency';
import { storage } from '../utils/storage';

interface CurrencyContextType {
    currency: string;
    currencySymbol: string;
    currencyLocale: string;
    setCurrency: (currency: string) => Promise<void>;
    formatCurrency: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);

    // Load currency from storage on mount
    useEffect(() => {
        loadCurrency();
    }, []);

    const loadCurrency = async () => {
        try {
            const settings = await storage.getData<{ currency: string }>('settings');
            if (settings?.currency) {
                setCurrencyState(settings.currency);
            }
        } catch (error) {
            console.error('Error loading currency:', error);
        }
    };

    const setCurrency = useCallback(async (newCurrency: string) => {
        try {
            // Update state immediately for instant UI update
            setCurrencyState(newCurrency);
            
            // Save to storage
            const settings = await storage.getData<any>('settings') || {};
            settings.currency = newCurrency;
            await storage.saveData('settings', settings);
        } catch (error) {
            console.error('Error saving currency:', error);
        }
    }, []);

    const formatCurrency = useCallback((amount: number): string => {
        const info = getCurrencyInfo(currency);
        const formatter = new Intl.NumberFormat(info.locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return formatter.format(amount);
    }, [currency]);

    const currencyInfo = getCurrencyInfo(currency);

    const value: CurrencyContextType = {
        currency,
        currencySymbol: currencyInfo.symbol,
        currencyLocale: currencyInfo.locale,
        setCurrency,
        formatCurrency,
    };

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};

export default CurrencyContext;
