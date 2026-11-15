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

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    isAxiosError: vi.fn(() => false),
  },
}));

const mockAxiosGet = (axios as any).get as ReturnType<typeof vi.fn>;
const mockAxiosPost = (axios as any).post as ReturnType<typeof vi.fn>;
const mockAxiosPut = (axios as any).put as ReturnType<typeof vi.fn>;
const mockAxiosPatch = (axios as any).patch as ReturnType<typeof vi.fn>;
const mockAxiosDelete = (axios as any).delete as ReturnType<typeof vi.fn>;

describe('api/crudService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000/api');
    localStorage.clear();
  });

  it('crudList sends GET with params and auth headers', async () => {
    const fakeResponse = { results: [], count: 0, next: null, previous: null };
    mockAxiosGet.mockResolvedValue({ data: fakeResponse });

    const result = await crudList('items', { search: 'x', page: 1 });

    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://localhost:8000/api/items/',
      expect.objectContaining({
        params: { search: 'x', page: 1 },
        headers: {},
      })
    );
    expect(result).toEqual(fakeResponse);
  });

  it('crudGet sends GET with id', async () => {
    mockAxiosGet.mockResolvedValue({ data: { id: 5 } });

    const result = await crudGet('items', 5);

    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://localhost:8000/api/items/5/',
      expect.objectContaining({
        headers: {},
      })
    );
    expect(result).toEqual({ id: 5 });
  });

  it('crudCreate sends POST with payload', async () => {
    mockAxiosPost.mockResolvedValue({ data: { id: 1, name: 'new' } });

    const result = await crudCreate('items', { name: 'new' });

    expect(mockAxiosPost).toHaveBeenCalledWith(
      'http://localhost:8000/api/items/',
      { name: 'new' },
      expect.objectContaining({ headers: {} })
    );
    expect(result).toEqual({ id: 1, name: 'new' });
  });

  it('crudUpdate sends PUT with id and payload', async () => {
    mockAxiosPut.mockResolvedValue({ data: { id: 1, name: 'updated' } });

    const result = await crudUpdate('items', 1, { name: 'updated' });

    expect(mockAxiosPut).toHaveBeenCalledWith(
      'http://localhost:8000/api/items/1/',
      { name: 'updated' },
      expect.objectContaining({ headers: {} })
    );
    expect(result).toEqual({ id: 1, name: 'updated' });
  });

  it('crudPatch sends PATCH with id and payload', async () => {
    mockAxiosPatch.mockResolvedValue({ data: { id: 1, name: 'patched' } });

    const result = await crudPatch('items', 1, { name: 'patched' });

    expect(mockAxiosPatch).toHaveBeenCalledWith(
      'http://localhost:8000/api/items/1/',
      { name: 'patched' },
      expect.objectContaining({ headers: {} })
    );
    expect(result).toEqual({ id: 1, name: 'patched' });
  });

  it('crudDelete sends DELETE with id', async () => {
    mockAxiosDelete.mockResolvedValue({});

    await crudDelete('items', 1);

    expect(mockAxiosDelete).toHaveBeenCalledWith(
      'http://localhost:8000/api/items/1/',
      expect.objectContaining({
        headers: {},
      })
    );
  });

  it('crudOptions fetches results with page_size=1000', async () => {
    mockAxiosGet.mockResolvedValue({
      data: { results: [{ id: 1 }, { id: 2 }], count: 2, next: null, previous: null },
    });

    const result = await crudOptions('items', { q: 'a' }, 1000);

    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://localhost:8000/api/items/options/',
      expect.objectContaining({
        params: { q: 'a', page_size: '1000' },
        headers: {},
      })
    );
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('includes Authorization header when token is present', async () => {
    localStorage.setItem('token', 'tok123');
    mockAxiosGet.mockResolvedValue({ data: { results: [] } });

    await crudList('items');

    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://localhost:8000/api/items/',
      expect.objectContaining({
        headers: { Authorization: 'Bearer tok123' },
      })
    );
  });

  it('sends empty headers when no token', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: [] } });

    await crudList('items');

    expect(mockAxiosGet).toHaveBeenCalledWith(
      'http://localhost:8000/api/items/',
      expect.objectContaining({
        headers: {},
      })
    );
  });
});
