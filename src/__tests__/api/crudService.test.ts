import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  crudList,
  crudGet,
  crudCreate,
  crudUpdate,
  crudPatch,
  crudDelete,
  crudOptions,
} from '../../api/crudService';

vi.mock('axios');

const mockAxios = axios as unknown as ReturnType<typeof vi.fn>;

describe('api/crudService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
    localStorage.clear();
  });

  it('crudList sends GET with params and auth headers', async () => {
    const fakeResponse = { results: [], count: 0, next: null, previous: null };
    mockAxios.mockResolvedValue({ data: fakeResponse });

    const result = await crudList('items', { search: 'x', page: 1 });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/items/',
        method: 'get',
        params: { search: 'x', page: 1 },
        headers: {},
      })
    );
    expect(result).toEqual(fakeResponse);
  });

  it('crudGet sends GET with id', async () => {
    mockAxios.mockResolvedValue({ data: { id: 5 } });

    const result = await crudGet('items', 5);

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/items/5/',
        method: 'get',
        headers: {},
      })
    );
    expect(result).toEqual({ id: 5 });
  });

  it('crudCreate sends POST with payload', async () => {
    mockAxios.mockResolvedValue({ data: { id: 1, name: 'new' } });

    const result = await crudCreate('items', { name: 'new' });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/items/',
        method: 'post',
        data: { name: 'new' },
        headers: {},
      })
    );
    expect(result).toEqual({ id: 1, name: 'new' });
  });

  it('crudUpdate sends PUT with id and payload', async () => {
    mockAxios.mockResolvedValue({ data: { id: 1, name: 'updated' } });

    const result = await crudUpdate('items', 1, { name: 'updated' });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/items/1/',
        method: 'put',
        data: { name: 'updated' },
        headers: {},
      })
    );
    expect(result).toEqual({ id: 1, name: 'updated' });
  });

  it('crudPatch sends PATCH with id and payload', async () => {
    mockAxios.mockResolvedValue({ data: { id: 1, name: 'patched' } });

    const result = await crudPatch('items', 1, { name: 'patched' });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/items/1/',
        method: 'patch',
        data: { name: 'patched' },
        headers: {},
      })
    );
    expect(result).toEqual({ id: 1, name: 'patched' });
  });

  it('crudDelete sends DELETE with id', async () => {
    mockAxios.mockResolvedValue({});

    await crudDelete('items', 1);

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/items/1/',
        method: 'delete',
        headers: {},
      })
    );
  });

  it('crudOptions fetches results with page_size=1000', async () => {
    mockAxios.mockResolvedValue({
      data: { results: [{ id: 1 }, { id: 2 }], count: 2, next: null, previous: null },
    });

    const result = await crudOptions('items', { q: 'a' });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/items/',
        method: 'get',
        params: { q: 'a', page_size: 1000 },
        headers: {},
      })
    );
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('includes Authorization header when token is present', async () => {
    localStorage.setItem('token', 'tok123');
    mockAxios.mockResolvedValue({ data: { results: [] } });

    await crudList('items');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { Authorization: 'Bearer tok123' },
      })
    );
  });

  it('sends empty headers when no token', async () => {
    mockAxios.mockResolvedValue({ data: { results: [] } });

    await crudList('items');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {},
      })
    );
  });
});
