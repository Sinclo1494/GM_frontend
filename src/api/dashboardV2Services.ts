const API = import.meta.env.VITE_API_BASE_URL;

import axios from "axios";
import type { DashboardV2Option, DashboardV2FilialeStat } from "../types/dashboardV2";
// Re-export getMaterialDetails from dataServices so the v2 ParcScreen keeps a
// single import site (it was previously imported from the wrong module).
export { getMaterialDetails } from "./dataServices";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface DashboardV2Params {
  code_filiale?: string;
  date_debut?: string;
  date_fin?: string;
  code_famille?: string;
  niveau?: string;
}

let filialesCache: DashboardV2Option[] | null = null;
let famillesCache: DashboardV2Option[] | null = null;

const abortControllers: Map<string, AbortController> = new Map();

const buildDashboardV2Params = (params: DashboardV2Params): Record<string, string> => {
  const queryParams: Record<string, string> = {};
  if (params.code_filiale) queryParams.code_filiale = params.code_filiale;
  if (params.date_debut) queryParams.date_debut = params.date_debut;
  if (params.date_fin) queryParams.date_fin = params.date_fin;
  if (params.code_famille) queryParams.code_famille = params.code_famille;
  if (params.niveau) queryParams.niveau = params.niveau;
  return queryParams;
};

// Keyed by `path + params` — the exact key of the `inflight` map. Keying the
// controllers by path alone meant that two concurrent requests for the same
// path with *different* filters (e.g. the shell's overview and a screen's
// overview) aborted each other.
const getDashboardV2Signal = (key: string): AbortSignal => {
  const existing = abortControllers.get(key);
  if (existing) {
    existing.abort();
  }
  const controller = new AbortController();
  abortControllers.set(key, controller);
  return controller.signal;
};

// Deduplicates concurrent identical requests. The page shell (NewDashboard)
// and each lazy-loaded screen both call getDashboardV2Overview at mount; a
// plain AbortController-per-path would have the second call abort the first,
// leaving the shell's overview null (and the top HealthBar full of zeroes).
// Keyed by (path, serialized params) so a filter change still issues a new
// request (and aborts the now-stale in-flight one for that path).
const inflight = new Map<string, Promise<unknown>>();

const fetchDashboardV2 = async <T = unknown>(
  path: string,
  params: DashboardV2Params
): Promise<T> => {
  const key =
    path + "|" + JSON.stringify(buildDashboardV2Params(params));
  const ongoing = inflight.get(key);
  if (ongoing) {
    return ongoing as Promise<T>;
  }
  const signal = getDashboardV2Signal(key);
  const promise = axios
    .get<T>(`${API}${path}`, {
      params: buildDashboardV2Params(params),
      headers: getAuthHeaders(),
      signal,
    })
    .then((res) => res.data)
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise;
};

export const getDashboardV2Overview = async <T = unknown>(
  params: DashboardV2Params = {}
): Promise<T> => {
  return fetchDashboardV2<T>("/dashboard-v2/overview/", params);
};

export const getDashboardV2Situation = async <T = unknown>(
  params: DashboardV2Params = {}
): Promise<T> => {
  return fetchDashboardV2<T>("/dashboard-v2/situation/", params);
};

export const getDashboardV2Disponibilite = async <T = unknown>(
  params: DashboardV2Params = {}
): Promise<T> => {
  return fetchDashboardV2<T>("/dashboard-v2/disponibilite/", params);
};

export const getDashboardV2Maintenance = async <T = unknown>(
  params: DashboardV2Params = {}
): Promise<T> => {
  return fetchDashboardV2<T>("/dashboard-v2/maintenance/", params);
};

export const getDashboardV2Rendement = async <T = unknown>(
  params: DashboardV2Params = {}
): Promise<T> => {
  return fetchDashboardV2<T>("/dashboard-v2/rendement/", params);
};

export const getDashboardV2Finances = async <T = unknown>(
  params: DashboardV2Params = {}
): Promise<T> => {
  return fetchDashboardV2<T>("/dashboard-v2/finances/", params);
};

export const getDashboardV2Filiales = async (): Promise<DashboardV2Option[]> => {
  if (filialesCache) {
    return filialesCache;
  }
  const { data } = await axios.get<{ results?: DashboardV2Option[] } | DashboardV2Option[]>(
    `${API}/dashboard-v2/filiales/`,
    { headers: getAuthHeaders() }
  );
  const results = Array.isArray(data) ? data : data.results ?? [];
  filialesCache = results;
  return filialesCache;
};

export const getDashboardV2Familles = async (): Promise<DashboardV2Option[]> => {
  if (famillesCache) {
    return famillesCache;
  }
  const { data } = await axios.get<{ results?: DashboardV2Option[] } | DashboardV2Option[]>(
    `${API}/dashboard-v2/familles/`,
    { headers: getAuthHeaders() }
  );
  const results = Array.isArray(data) ? data : data.results ?? [];
  famillesCache = results;
  return famillesCache;
};

export const getDashboardV2FilialeStats = async (
  params: DashboardV2Params = {}
): Promise<DashboardV2FilialeStat[]> => {
  return fetchDashboardV2<DashboardV2FilialeStat[]>(
    "/dashboard-v2/filiale-stats/",
    params
  );
};
