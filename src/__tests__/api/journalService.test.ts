import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { getJournal, getJournalById } from '../../api/journalService';
import type { JournalEntry, JournalFilterParams } from '../../types/journal';

vi.mock('axios');

const mockAxios = axios as unknown as ReturnType<typeof vi.fn>;

describe('api/journalService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
    localStorage.clear();
  });

  it('getJournal sends mapped filter params', async () => {
    const params: JournalFilterParams = {
      model_name: 'grand_materiel',
      object_id: '10',
      action: 'create',
      date_debut: '2024-01-01',
      date_fin: '2024-01-31',
      user: '1',
    };
    mockAxios.mockResolvedValue({ data: [] as JournalEntry[] });

    await getJournal(params);

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/journal/',
        method: 'get',
        params: {
          model_name: 'grand_materiel',
          object_id: '10',
          action: 'create',
          date_debut: '2024-01-01',
          date_fin: '2024-01-31',
          user: '1',
        },
        headers: {},
      })
    );
  });

  it('getJournal omits empty/undefined/null params', async () => {
    mockAxios.mockResolvedValue({ data: [] as JournalEntry[] });

    await getJournal({ model_name: 'x', action: '', user: undefined });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { model_name: 'x' },
      })
    );
  });

  it('getJournalById requests specific entry', async () => {
    const fake = { id: 1, model_name: 'x' } as JournalEntry;
    mockAxios.mockResolvedValue({ data: fake });

    const result = await getJournalById(1);

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/journal/1/',
        method: 'get',
        headers: {},
      })
    );
    expect(result).toBe(fake);
  });

  it('includes Authorization header when token exists', async () => {
    localStorage.setItem('token', 'tok123');
    mockAxios.mockResolvedValue({ data: [] as JournalEntry[] });

    await getJournal();

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { Authorization: 'Bearer tok123' },
      })
    );
  });
});
