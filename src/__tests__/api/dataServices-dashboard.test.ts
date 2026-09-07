import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getDashboard } from '../../api/dataServices';

vi.mock('axios');

const mockAxios = axios as unknown as ReturnType<typeof vi.fn>;

describe('api/dataServices.getDashboard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
    localStorage.clear();
  });

  it('sends all provided filters', async () => {
    mockAxios.mockResolvedValue({ data: {} });

    await getDashboard({
      code_filiale: 'F1',
      date_debut: '2024-01-01',
      date_fin: '2024-01-31',
      code_famille: 'C1',
      periode: 'month',
      mode: 'detail',
      niveau: '1',
      annee: '2024',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/dashboard/',
        method: 'get',
        params: {
          code_filiale: 'F1',
          date_debut: '2024-01-01',
          date_fin: '2024-01-31',
          code_famille: 'C1',
          periode: 'month',
          mode: 'detail',
          niveau: '1',
          annee: '2024',
        },
        headers: {},
      })
    );
  });

  it('omits undefined/null/empty filters', async () => {
    mockAxios.mockResolvedValue({ data: {} });

    await getDashboard({});

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        params: {},
      })
    );
  });
});
