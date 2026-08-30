const API = import.meta.env.VITE_API_BASE_URL;

import axios from "axios";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
import type {
  AnalyseQuantitativeType,
  AnalyseQuantitativeResumeType,
} from "../types/analyseQuantitative";

import type {
  AnalyseExploitationType,
  AnalyseExploitationResumeType,
} from "../types/analyseExploitation";

interface AQTPParams {
  code_filiale: string;
  date_debut: string;
  date_fin: string;
}

interface AETPParams {
  code_filiale: string;
  date_debut: string;
  date_fin: string;
}

export const getAQTP = async ({
  code_filiale,
  date_debut,
  date_fin,
}: AQTPParams): Promise<AnalyseQuantitativeType[]> => {
  const response = await axios.get<AnalyseQuantitativeType[]>(`${API}/aqtp/`, {
    params: {
      code_filiale,
      date_debut,
      date_fin,
    },
  });

  return response.data;
};

export const getAQTPR = async ({
  code_filiale,
  date_debut,
  date_fin,
}: AQTPParams): Promise<AnalyseQuantitativeResumeType> => {
  const response = await axios.get<AnalyseQuantitativeResumeType>(`${API}/aqtpr/`, {
    params: {
      code_filiale,
      date_debut,
      date_fin,
    },
  });

  return response.data;
};

export const getAETP = async ({
  code_filiale,
  date_debut,
  date_fin,
}: AETPParams): Promise<AnalyseExploitationType[]> => {
  const response = await axios.get<AnalyseExploitationType[]>(
    `${API}/aetp/`,
    {
      params: {
        code_filiale,
        date_debut,
        date_fin,
      },
    }
  );

  return response.data;
};

export const getAETPR = async ({
  code_filiale,
  date_debut,
  date_fin,
}: AETPParams): Promise<AnalyseExploitationResumeType> => {
  const response = await axios.get<AnalyseExploitationResumeType>(
    `${API}/aetpr/`,
    {
      params: {
        code_filiale,
        date_debut,
        date_fin,
      },
    }
  );

  return response.data;
};

export interface FilialeOption {
  value: string;
  label: string;
}

export const getFiliales = async (): Promise<FilialeOption[]> => {
  const { data } = await axios.get<{ results: FilialeOption[] } | FilialeOption[]>(`${API}/filiale/`, {
    headers: getAuthHeaders(),
  });
  const results = Array.isArray(data) ? data : (data as any).results ?? [];
  return results.map((filiale: any) => ({
    value: filiale.code_filiale,
    label: filiale.libelle_filiale,
  }));
};

export interface FamilleOption {
  value: string;
  label: string;
}

export const getFamilles = async (): Promise<FamilleOption[]> => {
  const { data } = await axios.get<{ results: FamilleOption[] } | FamilleOption[]>(`${API}/famille-materiel/`, {
    headers: getAuthHeaders(),
  });
  const results = Array.isArray(data) ? data : (data as any).results ?? [];
  return results.map((famille: any) => ({
    value: famille.code_famille,
    label: famille.libelle_famille,
  }));
};

export interface DashboardFilters {
  code_filiale?: string;
  date_debut?: string;
  date_fin?: string;
  code_famille?: string;
  periode?: string;
  mode?: string;
  niveau?: string;
  annee?: string;
}

export const getDashboard = async (filters: DashboardFilters = {}): Promise<any> => {
  const params: Record<string, string> = {};

  if (filters.code_filiale) params.code_filiale = filters.code_filiale;
  if (filters.date_debut) params.date_debut = filters.date_debut;
  if (filters.date_fin) params.date_fin = filters.date_fin;
  if (filters.code_famille) params.code_famille = filters.code_famille;
  if (filters.periode) params.periode = filters.periode;
  if (filters.mode) params.mode = filters.mode;
  if (filters.niveau) params.niveau = filters.niveau;
  if (filters.annee) params.annee = filters.annee;

  const { data } = await axios.get(`${API}/dashboard/`, {
    params,
    headers: getAuthHeaders(),
  });
  return data;
};

export interface MaterialDetailParams {
  code_filiale?: string;
  date_debut?: string;
  date_fin?: string;
  code_famille?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export const getMaterialDetails = async (params: MaterialDetailParams = {}) => {
  const queryParams: Record<string, string | number> = {};
  if (params.code_filiale) queryParams.code_filiale = params.code_filiale;
  if (params.date_debut) queryParams.date_debut = params.date_debut;
  if (params.date_fin) queryParams.date_fin = params.date_fin;
  if (params.code_famille) queryParams.code_famille = params.code_famille;
  if (params.search) queryParams.search = params.search;
  if (params.page) queryParams.page = params.page;
  if (params.page_size) queryParams.page_size = params.page_size;

  const { data } = await axios.get(`${API}/dashboard/material-details/`, {
    params: queryParams,
    headers: getAuthHeaders(),
  });
  return data;
};

