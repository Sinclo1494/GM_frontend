const API = import.meta.env.VITE_API_BASE_URL;

import axios from "axios";
import type {
  DashboardData,
  DashboardFilters,
  DashboardQuantitativeResume,
  DashboardExploitationResume,
} from "../types/dashboard";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getDashboard = async (filters: DashboardFilters = {}): Promise<DashboardData> => {
  const params: Record<string, string> = {};

  if (filters.code_filiale) {
    params.code_filiale = filters.code_filiale;
  }
  if (filters.date_debut) {
    params.date_debut = filters.date_debut;
  }
  if (filters.date_fin) {
    params.date_fin = filters.date_fin;
  }
  if (filters.code_famille) {
    params.code_famille = filters.code_famille;
  }
  if (filters.periode) {
    params.periode = filters.periode;
  }
  if (filters.mode) {
    params.mode = filters.mode;
  }
  if (filters.niveau) {
    params.niveau = filters.niveau;
  }
  if (filters.annee) {
    params.annee = filters.annee;
  }

  const { data } = await axios.get<DashboardData>(`${API}/dashboard/`, {
    params,
    headers: getAuthHeaders(),
  });

  return data;
};

export interface DashboardAnalysisData {
  quantitativeResume: DashboardQuantitativeResume | null;
  exploitationResume: DashboardExploitationResume | null;
}
