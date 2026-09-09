import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import UsersPage from '../../pages/UsersPage';

vi.mock('../../components/Crud/CrudPage', () => ({
  __esModule: true,
  default: () => <div>CrudPageMock</div>,
}));

describe('pages/UsersPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
  });

  it('renders UsersPage title', () => {
    render(<UsersPage />);
    expect(screen.getByText('Utilisateurs')).toBeDefined();
  });
});
