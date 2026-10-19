import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface PendingFiltersContextType {
  includePending: boolean;
  setIncludePending: (value: boolean) => void;
}

const PendingFiltersContext = createContext<PendingFiltersContextType | undefined>(undefined);

interface PendingFiltersProviderProps {
  children: ReactNode;
}

export function PendingFiltersProvider({ children }: PendingFiltersProviderProps) {
  const [includePending, setIncludePending] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('includePending');
    if (stored !== null) {
      setIncludePending(stored === 'true');
    }
  }, []);

  const setIncludePendingValue = (value: boolean) => {
    setIncludePending(value);
    localStorage.setItem('includePending', String(value));
  };

  return (
    <PendingFiltersContext.Provider value={{ includePending, setIncludePending: setIncludePendingValue }}>
      {children}
    </PendingFiltersContext.Provider>
  );
}

export function usePendingFilters() {
  const context = useContext(PendingFiltersContext);
  if (!context) {
    throw new Error('usePendingFilters must be used within a PendingFiltersProvider');
  }
  return context;
}