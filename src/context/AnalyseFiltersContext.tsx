import { useState, useEffect, useContext, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import {
  AnalyseFiltersContext,
  getStoredFilters,
  type AnalyseFilters,
} from "./useAnalyseFilters";
import { lockedFiliale } from "./filialeScope";

const STORAGE_KEY = "analyse_filters";

export function AnalyseFiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<AnalyseFilters>(() => getStoredFilters());

  // The default affiliate is a hardcoded code and the persisted filters are
  // not scoped to an account, so a user assigned to another affiliate would
  // keep querying a database they cannot read: the analysis endpoints answer
  // 403 ("Accès refusé à cette filiale.") for a `code_filiale` outside the
  // user's scope. Pin the filter to the affiliate the user is locked to.
  const user = useContext(AuthContext)?.user ?? null;
  const locked = lockedFiliale(user);

  useEffect(() => {
    if (!locked) return;
    setFilters((prev) =>
      prev.codeFiliale === locked ? prev : { ...prev, codeFiliale: locked },
    );
  }, [locked]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const setCodeFiliale = (value: string) => setFilters((prev) => ({ ...prev, codeFiliale: value }));
  const setDateDebut = (value: string) => setFilters((prev) => ({ ...prev, dateDebut: value }));
  const setDateFin = (value: string) => setFilters((prev) => ({ ...prev, dateFin: value }));

  return (
    <AnalyseFiltersContext.Provider value={{ ...filters, setCodeFiliale, setDateDebut, setDateFin }}>
      {children}
    </AnalyseFiltersContext.Provider>
  );
}
