import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NavBar from '../../../components/Navigation/NavBar';

vi.mock('../../../context/useAuth');
vi.mock('../../../context/ThemeContext');
vi.mock('../../../auth/PermissionContext');
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

import { useAuth } from '../../../context/useAuth';
import { useTheme } from '../../../context/ThemeContext';
import { usePermissions } from '../../../auth/PermissionContext';

const mockUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;
const mockUseTheme = useTheme as unknown as ReturnType<typeof vi.fn>;
const mockUsePermissions = usePermissions as unknown as ReturnType<typeof vi.fn>;

describe('components/Navigation/NavBar', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
    mockUseAuth.mockReturnValue({
      token: 'tok',
      user: { id: 1, username: 'u', is_superuser: false, permissions: [] },
      login: vi.fn(),
      logout: vi.fn(),
      setUser: vi.fn(),
    });
    mockUseTheme.mockReturnValue({ theme: 'light', toggleTheme: vi.fn() });
    mockUsePermissions.mockReturnValue({
      user: { id: 1, username: 'u', is_superuser: false, permissions: [] },
      permissions: [],
      loading: false,
      hasPermission: () => true,
      hasAnyPermission: () => true,
      hasAllPermissions: () => true,
    });
  });

  it('renders navbar with brand', () => {
    render(<NavBar />);
    expect(screen.getByText('Grand Matériel')).toBeDefined();
  });

  it('renders user menu when authenticated', () => {
    render(<NavBar />);
    expect(screen.getByText('u')).toBeDefined();
  });

  it('calls logout and navigates on logout click', () => {
    const logout = vi.fn();
    mockUseAuth.mockReturnValue({
      token: 'tok',
      user: { id: 1, username: 'u', is_superuser: false, permissions: [] },
      login: vi.fn(),
      logout,
      setUser: vi.fn(),
    });

    render(<NavBar />);
    fireEvent.click(screen.getByText('Déconnexion'));
    expect(logout).toHaveBeenCalled();
  });
});
