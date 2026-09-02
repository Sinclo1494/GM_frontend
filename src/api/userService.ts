import axios from "axios";
import type { UserInfo, UserPreferences, CurrentUserResponse } from "../types/user";

const API = import.meta.env.VITE_API_BASE_URL;

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface UserProfilePayload {
  permissions?: string[];
}

export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const { data } = await axios.get<CurrentUserResponse>(`${API}/users/me/`, {
    headers: authHeaders(),
  });
  return data;
};

export const getUsers = async (params?: { search?: string; page?: number; page_size?: number }) => {
  const { data } = await axios.get<{ results: UserInfo[]; count: number }>(`${API}/users/`, {
    params,
    headers: authHeaders(),
  });
  return data;
};

export const getUser = async (id: number | string) => {
  const { data } = await axios.get(`${API}/users/${id}/`, {
    headers: authHeaders(),
  });
  return data;
};

export interface CreateUserPayload {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  is_active?: boolean;
}

export const createUser = async (payload: CreateUserPayload) => {
  const { data } = await axios.post<CreateUserPayload>(`${API}/users/`, payload, {
    headers: authHeaders(),
  });
  return data;
};

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  is_active?: boolean;
}

export const updateUser = async (id: number | string, payload: UpdateUserPayload) => {
  const { data } = await axios.patch<UpdateUserPayload>(`${API}/users/${id}/`, payload, {
    headers: authHeaders(),
  });
  return data;
};

export const setUserPassword = async (id: number | string, password: string) => {
  const { data } = await axios.post<{ message: string }>(`${API}/users/${id}/set_password/`, { password }, {
    headers: authHeaders(),
  });
  return data;
};

export const deleteUser = async (id: number | string) => {
  await axios.delete(`${API}/users/${id}/`, {
    headers: authHeaders(),
  });
};

export const getUserPermissions = async (id: number | string) => {
  const { data } = await axios.get<{ permissions: string[] }>(`${API}/users/${id}/permissions/`, {
    headers: authHeaders(),
  });
  return data.permissions || [];
};

export const updateUserPermissions = async (id: number | string, permissions: string[]) => {
  const { data } = await axios.patch(`${API}/users/${id}/permissions/`, { permissions }, {
    headers: authHeaders(),
  });
  return data.permissions || [];
};

export const getUserPreferences = async (): Promise<UserPreferences> => {
  const { data } = await axios.get<UserPreferences>(`${API}/users/preferences/`, {
    headers: authHeaders(),
  });
  return data;
};

export const updateUserPreferences = async (payload: Partial<UserPreferences>): Promise<UserPreferences> => {
  const { data } = await axios.patch<UserPreferences>(`${API}/users/preferences/`, payload, {
    headers: authHeaders(),
  });
  return data;
};

export const changePassword = async (current_password: string, new_password: string) => {
  const { data } = await axios.post<{ detail: string }>(`${API}/users/change-password/`, {
    current_password,
    new_password,
  }, {
    headers: authHeaders(),
  });
  return data;
};
