import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';

vi.mock('../../api/dataServices');
vi.mock('../../components/Crud/CrudTable', () => ({
  __esModule: true,
  default: () => <div>CrudTableMock</div>,
}));

describe('pages/Dashboard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8000');
  });

  it('renders dashboard page', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard')).toBeDefined();
  });
});
