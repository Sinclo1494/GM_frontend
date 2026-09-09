import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getAQTP,
  getAQTPR,
  getAETP,
  getAETPR,
  getFiliales,
  getFamilles,
  getDashboard,
  getMaterialDetails,
} from '../../api/dataServices';

vi.mock('axios');

const mockAxios = axios as unknown as ReturnType<typeof vi.fn>;

describe('api/dataServices', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
    localStorage.clear();
  });

  it('getAQTP calls correct endpoint with params', async () => {
    mockAxios.mockResolvedValue({ data: [] });

    await getAQTP({ code_filiale: 'F1', date_debut: '2024-01-01', date_fin: '2024-01-31' });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/aqtp/',
        method: 'get',
        params: { code_filiale: 'F1', date_debut: '2024-01-01', date_fin: '2024-01-31' },
      })
    );
  });

  it('getAQTPR returns resume data', async () => {
    const fake = { total: 1 };
    mockAxios.mockResolvedValue({ data: fake });

    const result = await getAQTPR({ code_filiale: 'F1', date_debut: '2024-01-01', date_fin: '2024-01-31' });

    expect(result).toBe(fake);
  });

  it('getAETP calls correct endpoint with params', async () => {
    mockAxios.mockResolvedValue({ data: [] });

    await getAETP({ code_filiale: 'F1', date_debut: '2024-01-01', date_fin: '2024-01-31' });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/aetp/',
        method: 'get',
        params: { code_filiale: 'F1', date_debut: '2024-01-01', date_fin: '2024-01-31' },
      })
    );
  });

  it('getAETPR returns resume data', async () => {
    const fake = { total: 2 };
    mockAxios.mockResolvedValue({ data: fake });

    const result = await getAETPR({ code_filiale: 'F1', date_debut: '2024-01-01', date_fin: '2024-01-31' });

    expect(result).toBe(fake);
  });

  it('getFiliales handles paginated response', async () => {
    mockAxios.mockResolvedValue({
      data: {
        results: [{ code_filiale: 'F1', libelle_filiale: 'Filiale 1' }],
      },
    });

    const result = await getFiliales();

    expect(result).toEqual([{ value: 'F1', label: 'Filiale 1' }]);
  });

  it('getFiliales handles array response', async () => {
    mockAxios.mockResolvedValue({
      data: [{ code_filiale: 'F1', libelle_filiale: 'Filiale 1' }],
    });

    const result = await getFiliales();

    expect(result).toEqual([{ value: 'F1', label: 'Filiale 1' }]);
  });

  it('getFamilles handles paginated response', async () => {
    mockAxios.mockResolvedValue({
      data: {
        results: [{ code_famille: 'C1', libelle_famille: 'Cat 1' }],
      },
    });

    const result = await getFamilles();

    expect(result).toEqual([{ value: 'C1', label: 'Cat 1' }]);
  });

  it('getDashboard sends filters as query params', async () => {
    mockAxios.mockResolvedValue({ data: {} });

    await getDashboard({ code_filiale: 'F1', date_debut: '2024-01-01', annee: '2024' });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/dashboard/',
        method: 'get',
        params: { code_filiale: 'F1', date_debut: '2024-01-01', annee: '2024' },
      })
    );
  });

  it('getMaterialDetails sends correct params', async () => {
    mockAxios.mockResolvedValue({ data: {} });

    await getMaterialDetails({
      code_filiale: 'F1',
      date_debut: '2024-01-01',
      date_fin: '2024-01-31',
      code_famille: 'C1',
      search: 'x',
      page: 1,
      page_size: 20,
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/dashboard/material-details/',
        method: 'get',
        params: {
          code_filiale: 'F1',
          date_debut: '2024-01-01',
          date_fin: '2024-01-31',
          code_famille: 'C1',
          search: 'x',
          page: 1,
          page_size: 20,
        },
      })
    );
  });

  it('includes Authorization header when token present', async () => {
    localStorage.setItem('token', 'tok123');
    mockAxios.mockResolvedValue({ data: [] });

    await getFiliales();

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { Authorization: 'Bearer tok123' },
      })
    );
  });
});
