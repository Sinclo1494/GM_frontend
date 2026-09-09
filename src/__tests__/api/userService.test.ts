import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getCurrentUser,
  getUsers,
  getUser,
  createUser,
  updateUser,
  setUserPassword,
  deleteUser,
  getUserPermissions,
  updateUserPermissions,
  getUserPreferences,
  updateUserPreferences,
  changePassword,
} from '../../api/userService';

vi.mock('axios');

const mockAxios = axios as unknown as ReturnType<typeof vi.fn>;

describe('api/userService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
    localStorage.clear();
  });

  it('getCurrentUser returns current user', async () => {
    const fake = { id: 1, username: 'u', permissions: [], is_superuser: false };
    mockAxios.mockResolvedValue({ data: fake });

    const result = await getCurrentUser();

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/users/me/',
        method: 'get',
        headers: {},
      })
    );
    expect(result).toBe(fake);
  });

  it('getUsers returns paginated data', async () => {
    mockAxios.mockResolvedValue({
      data: { results: [{ id: 1 }], count: 1 },
    });

    const result = await getUsers({ search: 'a', page: 1, page_size: 10 });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/users/',
        method: 'get',
        params: { search: 'a', page: 1, page_size: 10 },
        headers: {},
      })
    );
    expect(result).toEqual({ results: [{ id: 1 }], count: 1 });
  });

  it('getUser returns single user', async () => {
    mockAxios.mockResolvedValue({ data: { id: 2 } });

    const result = await getUser(2);

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/users/2/',
        method: 'get',
        headers: {},
      })
    );
    expect(result).toEqual({ id: 2 });
  });

  it('createUser posts payload', async () => {
    mockAxios.mockResolvedValue({ data: { id: 3 } });

    const result = await createUser({
      username: 'new',
      first_name: 'N',
      last_name: 'U',
      email: 'n@u.com',
      password: 'secret',
    });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/users/',
        method: 'post',
        data: {
          username: 'new',
          first_name: 'N',
          last_name: 'U',
          email: 'n@u.com',
          password: 'secret',
        },
        headers: {},
      })
    );
    expect(result).toEqual({ id: 3 });
  });

  it('updateUser patches user', async () => {
    mockAxios.mockResolvedValue({ data: { id: 2, email: 'new@x.com' } });

    const result = await updateUser(2, { email: 'new@x.com' });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/users/2/',
        method: 'patch',
        data: { email: 'new@x.com' },
        headers: {},
      })
    );
    expect(result).toEqual({ id: 2, email: 'new@x.com' });
  });

  it('setUserPassword posts password', async () => {
    mockAxios.mockResolvedValue({ data: { message: 'ok' } });

    const result = await setUserPassword(2, 'newpass');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/users/2/set_password/',
        method: 'post',
        data: { password: 'newpass' },
        headers: {},
      })
    );
    expect(result).toEqual({ message: 'ok' });
  });

  it('deleteUser sends DELETE', async () => {
    mockAxios.mockResolvedValue({});

    await deleteUser(2);

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/users/2/',
        method: 'delete',
        headers: {},
      })
    );
  });

  it('getUserPermissions returns permissions array', async () => {
    mockAxios.mockResolvedValue({ data: { permissions: ['a.read'] } });

    const result = await getUserPermissions(2);

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/users/2/permissions/',
        method: 'get',
        headers: {},
      })
    );
    expect(result).toEqual(['a.read']);
  });

  it('getUserPermissions falls back to empty array when missing', async () => {
    mockAxios.mockResolvedValue({ data: {} });

    const result = await getUserPermissions(2);

    expect(result).toEqual([]);
  });

  it('updateUserPermissions patches permissions', async () => {
    mockAxios.mockResolvedValue({ data: { permissions: ['a.write'] } });

    const result = await updateUserPermissions(2, ['a.write']);

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/users/2/permissions/',
        method: 'patch',
        data: { permissions: ['a.write'] },
        headers: {},
      })
    );
    expect(result).toEqual(['a.write']);
  });

  it('getUserPreferences returns preferences', async () => {
    const fake = { default_landing_page: '/', remember_last_visited_page: true };
    mockAxios.mockResolvedValue({ data: fake });

    const result = await getUserPreferences();

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/users/preferences/',
        method: 'get',
        headers: {},
      })
    );
    expect(result).toBe(fake);
  });

  it('updateUserPreferences patches preferences', async () => {
    const fake = { default_landing_page: '/gestion' };
    mockAxios.mockResolvedValue({ data: fake });

    const result = await updateUserPreferences({ default_landing_page: '/gestion' });

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/users/preferences/',
        method: 'patch',
        data: { default_landing_page: '/gestion' },
        headers: {},
      })
    );
    expect(result).toBe(fake);
  });

  it('changePassword posts credentials', async () => {
    mockAxios.mockResolvedValue({ data: { detail: 'ok' } });

    const result = await changePassword('old', 'new');

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'http://localhost:8000/users/change-password/',
        method: 'post',
        data: { current_password: 'old', new_password: 'new' },
        headers: {},
      })
    );
    expect(result).toEqual({ detail: 'ok' });
  });

  it('includes Authorization header when token exists', async () => {
    localStorage.setItem('token', 'tok123');
    mockAxios.mockResolvedValue({ data: {} });

    await getCurrentUser();

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: { Authorization: 'Bearer tok123' },
      })
    );
  });
});
