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

export async function crudList<T>(
    endpoint: string,
    params: CrudListParams = {},
): Promise<T[]> {
    const { data } = await axios.get<T[]>(`${API}/${endpoint}/`, {
        params,
        headers: authHeaders(),
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
    const { data } = await axios.get<T[]>(`${API}/${endpoint}/`, {
        params,
        headers: authHeaders(),
    });
    return data;
}
