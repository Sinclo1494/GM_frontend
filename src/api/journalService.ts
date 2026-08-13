import axios from "axios";
import type { JournalEntry, JournalFilterParams } from "../types/journal";

const API = import.meta.env.VITE_API_BASE_URL;
const JOURNAL_URL = `${API}/journal/`;

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildParams = (
  params: JournalFilterParams,
): Record<string, string> => {
  const out: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      out[key] = String(value);
    }
  });
  return out;
};

export const getJournal = async (
  params: JournalFilterParams = {},
): Promise<JournalEntry[]> => {
  const response = await axios.get<JournalEntry[]>(JOURNAL_URL, {
    params: buildParams(params),
    headers: authHeaders(),
  });
  return response.data;
};

export const getJournalById = async (
  id: number | string,
): Promise<JournalEntry> => {
  const response = await axios.get<JournalEntry>(`${JOURNAL_URL}${id}/`, {
    headers: authHeaders(),
  });
  return response.data;
};
