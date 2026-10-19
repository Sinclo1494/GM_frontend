import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const listPending = async (params = {}) => {
  const { data } = await axios.get(`${API}/import/pending/list/`, {
    params,
    headers: getAuthHeaders(),
  });
  return data;
};

export const confirmPending = async (payload: any) => {
  const { data } = await axios.post(`${API}/import/pending/confirm/`, payload, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const bulkConfirmPending = async (batchId: string) => {
  const { data } = await axios.post(`${API}/import/pending/bulk-confirm/`, { batch_id: batchId }, {
    headers: getAuthHeaders(),
  });
  return data;
};

export const rejectPending = async (batchId: string, reason: string) => {
  const { data } = await axios.post(`${API}/import/pending/reject/`, { batch_id: batchId, reason }, {
    headers: getAuthHeaders(),
  });
  return data;
};
