import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { loginUser } from '../../api/auth';

vi.mock('axios');

const mockAxios = axios as unknown as ReturnType<typeof vi.fn>;

describe('api/auth', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
  });

  it('loginUser posts username/password and returns data', async () => {
    mockAxios.mockResolvedValue({ data: { access: 'acc', refresh: 'ref' } });

    const result = await loginUser('user', 'pass');

    expect(mockAxios).toHaveBeenCalledTimes(1);
    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/token/',
        method: 'post',
        data: { username: 'user', password: 'pass' },
      })
    );
    expect(result).toEqual({ access: 'acc', refresh: 'ref' });
  });

  it('loginUser propagates errors', async () => {
    mockAxios.mockRejectedValue(new Error('401'));

    await expect(loginUser('u', 'p')).rejects.toThrow('401');
  });
});
