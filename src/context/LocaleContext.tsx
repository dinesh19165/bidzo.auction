import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

type LanguageKey = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml' | 'bn' | 'mr';
type CurrencyKey = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED';

interface LocaleContextValue {
  language: LanguageKey;
  currency: CurrencyKey;
  languageLabel: string;
  currencyLabel: string;
  currencySymbol: string;
  setLanguage: (language: LanguageKey) => void;
  setCurrency: (currency: CurrencyKey) => void;
  translate: (key: string, replacements?: Record<string, string | number>) => string;
  formatCurrency: (value: number | string) => string;
  parseCurrency: (value: number | string) => number;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'bidzo-language';
const CURRENCY_STORAGE_KEY = 'bidzo-currency';

const languageLabels: Record<LanguageKey, string> = {
  en: 'English',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  bn: 'বাংলা',
  mr: 'मराठी',
};

const currencyConfig: Record<CurrencyKey, { code: CurrencyKey; symbol: string; locale: string; label: string }> = {
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN', label: 'INR ₹' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', label: 'USD $' },
  EUR: { code: 'EUR', symbol: '€', locale: 'en-IE', label: 'EUR €' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', label: 'GBP £' },
  AED: { code: 'AED', symbol: 'د.إ', locale: 'ar-AE', label: 'AED د.إ' },
};

// Minimal translations object. Add missing keys per-language progressively to avoid duplicates.
const translations: Record<LanguageKey, Record<string, string>> = {
  en: {
    freeShipping: 'Free express shipping',
    onOrdersOver: 'on orders over {{amount}}',
    help: 'Help',
    login: 'Login',
    register: 'Register',
    marketplace: 'Marketplace',
    allCategories: 'All categories',
    searchPlaceholder: 'Search products, auctions, sellers...',
    currentBid: 'Current bid',
    reservePrice: 'Reserve price',
    buyNow: 'Buy now',
    viewDetails: 'View details',
    filters: 'Filters',
    reset: 'Reset',
    price: 'Price',
  },
  hi: {},
  te: {},
  ta: {},
  kn: {},
  ml: {},
  bn: {},
  mr: {},
};

function getBrowserLanguage(): LanguageKey {
  if (typeof window === 'undefined') return 'en';
  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageKey | null;
  if (saved && Object.prototype.hasOwnProperty.call(languageLabels, saved)) return saved;
  const browserLang = (window.navigator.language || 'en').slice(0, 2) as LanguageKey;
  return Object.keys(languageLabels).includes(browserLang) ? browserLang : 'en';
}

function getBrowserCurrency(): CurrencyKey {
  if (typeof window === 'undefined') return 'INR';
  const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyKey | null;
  return saved && Object.prototype.hasOwnProperty.call(currencyConfig, saved) ? saved : 'INR';
}

function replacePlaceholders(message: string, replacements?: Record<string, string | number>) {
  if (!replacements) return message;
  return message.replace(/\{\{(\w+)\}\}/g, (_, key) => String(replacements[key] ?? ''));
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageKey>(getBrowserLanguage);
  const [currency, setCurrency] = useState<CurrencyKey>(getBrowserCurrency);

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      document.documentElement.lang = language === 'en' ? 'en' : language;
    } catch (e) {
      // ignore
    }
  }, [language]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    } catch (e) {
      // ignore
    }
  }, [currency]);

  const translate = (key: string, replacements?: Record<string, string | number>) => {
    const langDict = translations[language] || {};
    const msg = langDict[key] ?? translations.en[key] ?? key;
    return replacePlaceholders(msg, replacements);
  };

  const formatCurrency = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value as string) || 0 : (value as number);
    const cfg = currencyConfig[currency];
    try {
      return new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: cfg.code }).format(num);
    } catch (e) {
      return `${cfg.symbol}${num.toFixed(2)}`;
    }
  };

  const parseCurrency = (value: number | string) => {
    if (typeof value === 'number') return value;
    const cleaned = String(value).replace(/[^0-9.-]+/g, '');
    return parseFloat(cleaned) || 0;
  };

  const value = useMemo(
    () => ({
      language,
      currency,
      languageLabel: languageLabels[language],
      currencyLabel: currencyConfig[currency].label,
      currencySymbol: currencyConfig[currency].symbol,
      setLanguage: (l: LanguageKey) => setLanguage(l),
      setCurrency: (c: CurrencyKey) => setCurrency(c),
      translate,
      formatCurrency,
      parseCurrency,
    }),
    [language, currency]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

// Backwards-compatible alias for older imports
export const useLocaleContext = useLocale;
