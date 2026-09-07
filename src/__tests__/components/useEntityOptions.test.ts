import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useEntityOptions } from '../../components/Crud/useEntityOptions';

vi.mock('../../api/crudService', () => ({
  crudOptions: vi.fn(),
}));

import { crudOptions } from '../../api/crudService';

const mockCrudOptions = crudOptions as unknown as ReturnType<typeof vi.fn>;

describe('components/Crud/useEntityOptions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
  });

  it('fetches and maps options on mount', async () => {
    mockCrudOptions.mockResolvedValue([
      { id: '1', name: 'One' },
      { id: '2', name: 'Two' },
    ]);

    const { result } = renderHook(() =>
      useEntityOptions<any>('items', 'id', 'name')
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.options).toEqual([
      { value: '1', label: 'One' },
      { value: '2', label: 'Two' },
    ]);
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    mockCrudOptions.mockRejectedValue(new Error('fail'));

    const { result } = renderHook(() =>
      useEntityOptions<any>('items', 'id', 'name')
    );

    await waitFor(() => {
      expect(result.current.error).toBe('fail');
    });
  });

  it('refetches when endpoint changes', async () => {
    mockCrudOptions.mockResolvedValue([{ id: '1', name: 'One' }]);

    const { result, rerender } = renderHook(
      ({ endpoint }) => useEntityOptions<any>(endpoint, 'id', 'name'),
      { initialProps: { endpoint: 'items' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockCrudOptions).toHaveBeenCalledWith('items', {});

    rerender({ endpoint: 'other' });

    await waitFor(() => {
      expect(mockCrudOptions).toHaveBeenCalledWith('other', {});
    });
  });
});
