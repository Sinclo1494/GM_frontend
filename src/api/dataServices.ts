const API = "http://192.168.0.232:8000/api";

import axios from "axios";
import type {
  AnalyseQuantitativeType,
  AnalyseQuantitativeResumeType,
} from "../types/analyseQuantitative";

interface AQTPParams {
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