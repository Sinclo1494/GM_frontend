import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JournalisationTable from '../../../components/Journalisation/JournalisationTable';

describe('components/Journalisation/JournalisationTable', () => {
  const rows = [
    {
      id: 1,
      model_name: 'grand_materiel',
      object_id: '1',
      action: 'create',
      data: {},
      user: 'admin',
      timestamp: '2024-01-01T00:00:00Z',
    },
  ];

  it('renders journal rows', () => {
    render(
      <JournalisationTable
        rows={rows}
        loading={false}
        error={null}
        sortField={null}
        sortOrder="asc"
        onSort={vi.fn()}
        currentPage={1}
        itemsPerPage={10}
        totalRows={1}
        totalPages={1}
        onPageChange={vi.fn()}
        onItemsPerPageChange={vi.fn()}
        onRowClick={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('grand_materiel')).toBeDefined();
    expect(screen.getByText('admin')).toBeDefined();
  });

  it('shows loading state', () => {
    render(
      <JournalisationTable
        rows={[]}
        loading={true}
        error={null}
        sortField={null}
        sortOrder="asc"
        onSort={vi.fn()}
        currentPage={1}
        itemsPerPage={10}
        totalRows={0}
        totalPages={1}
        onPageChange={vi.fn()}
        onItemsPerPageChange={vi.fn()}
        onRowClick={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Chargement...')).toBeDefined();
  });

  it('shows empty state', () => {
    render(
      <JournalisationTable
        rows={[]}
        loading={false}
        error={null}
        sortField={null}
        sortOrder="asc"
        onSort={vi.fn()}
        currentPage={1}
        itemsPerPage={10}
        totalRows={0}
        totalPages={1}
        onPageChange={vi.fn()}
        onItemsPerPageChange={vi.fn()}
        onRowClick={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Aucune entrée de journal trouvée')).toBeDefined();
  });

  it('shows error and retry button', () => {
    const onRetry = vi.fn();
    render(
      <JournalisationTable
        rows={[]}
        loading={false}
        error="Error loading"
        sortField={null}
        sortOrder="asc"
        onSort={vi.fn()}
        currentPage={1}
        itemsPerPage={10}
        totalRows={0}
        totalPages={1}
        onPageChange={vi.fn()}
        onItemsPerPageChange={vi.fn()}
        onRowClick={vi.fn()}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Error loading')).toBeDefined();
    fireEvent.click(screen.getByText('Réessayer'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
