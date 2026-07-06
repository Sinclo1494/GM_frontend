const API = "http://192.168.0.242:8000/api";

import axios from "axios";
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

