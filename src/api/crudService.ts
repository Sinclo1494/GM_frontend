import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CrudListParams {
    search?: string;
    page?: number;
    page_size?: number;
    [key: string]: string | number | undefined;
}

export interface CrudListResponse<T> {
    results: T[];
    count: number;
    next: string | null;
    previous: string | null;
}

export async function crudList<T>(
    endpoint: string,
    params: CrudListParams = {},
    options?: { signal?: AbortSignal },
): Promise<CrudListResponse<T>> {
    const { data } = await axios.get<CrudListResponse<T>>(`${API}/${endpoint}/`, {
        params,
        headers: authHeaders(),
        signal: options?.signal,
    });
    return data;
}

export async function crudGet<T>(
    endpoint: string,
    id: number | string,
): Promise<T> {
    const { data } = await axios.get<T>(`${API}/${endpoint}/${id}/`, {
        headers: authHeaders(),
    });
    return data;
}

export async function crudCreate<T>(
    endpoint: string,
    payload: Record<string, unknown>,
): Promise<T> {
    const { data } = await axios.post<T>(`${API}/${endpoint}/`, payload, {
        headers: authHeaders(),
    });
    return data;
}

export async function crudUpdate<T>(
    endpoint: string,
    id: number | string,
    payload: Record<string, unknown>,
): Promise<T> {
    const { data } = await axios.put<T>(
        `${API}/${endpoint}/${id}/`,
        payload,
        { headers: authHeaders() },
    );
    return data;
}

export async function crudPatch<T>(
    endpoint: string,
    id: number | string,
    payload: Record<string, unknown>,
): Promise<T> {
    const { data } = await axios.patch<T>(
        `${API}/${endpoint}/${id}/`,
        payload,
        { headers: authHeaders() },
    );
    return data;
}

export async function crudDelete(
    endpoint: string,
    id: number | string,
): Promise<void> {
    await axios.delete(`${API}/${endpoint}/${id}/`, {
        headers: authHeaders(),
    });
}

export async function crudOptions<T>(
    endpoint: string,
    params: Record<string, string> = {},
): Promise<T[]> {
    const { data } = await axios.get<CrudListResponse<T>>(`${API}/${endpoint}/`, {
        params: { ...params, page_size: 1000 },
        headers: authHeaders(),
    });
    return data.results;
}
