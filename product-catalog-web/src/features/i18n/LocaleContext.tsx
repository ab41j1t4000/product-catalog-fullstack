import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "product-catalog-locale";

export type Locale = "en" | "ja";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  formatCurrency: (priceCents: number) => string;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "ja" ? "ja" : "en";
}

function createCurrencyFormatter(locale: Locale) {
  return locale === "ja"
    ? new Intl.NumberFormat("ja-JP", {
        style: "currency",
        currency: "JPY",
        maximumFractionDigits: 0,
      })
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
}

export function LocaleProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState<Locale>(() => readStoredLocale());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const formatCurrency = (priceCents: number) => {
    const formatter = createCurrencyFormatter(locale);
    const amount = locale === "ja" ? Math.round(priceCents) : priceCents / 100;
    return formatter.format(amount);
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale: () => setLocale((current) => (current === "en" ? "ja" : "en")),
        formatCurrency,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
