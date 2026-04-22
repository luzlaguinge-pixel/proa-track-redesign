import { useState } from 'react';

export type Country = 'todos' | 'AR' | 'UY' | 'GT';

const STORAGE_KEY = 'proa_dashboard_country';

export const useCountryFilter = () => {
  const [country, setCountry] = useState<Country>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Country | null;
    return stored ?? 'todos';
  });

  const updateCountry = (c: Country) => {
    setCountry(c);
    localStorage.setItem(STORAGE_KEY, c);
  };

  return { country, setCountry: updateCountry };
};
