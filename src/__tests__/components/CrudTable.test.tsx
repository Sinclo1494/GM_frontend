import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CrudTable from '../../components/Crud/CrudTable';
import type { ColumnDef } from '../../components/Crud/CrudTable';

interface Item {
  id: number;
  name: string;
}

const columns: ColumnDef<Item>[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
];

describe('components/Crud/CrudTable', () => {
  it('renders empty state when no data', () => {
    render(
      <CrudTable<Item>
        columns={columns}
        data={[]}
        loading={false}
        error={null}
        searchTerm=""
        onSearchChange={vi.fn()}
        sortField={null}
        sortOrder="asc"
        onSort={vi.fn()}
        currentPage={1}
        onPageChange={vi.fn()}
        itemsPerPage={10}
        onItemsPerPageChange={vi.fn()}
        onRetry={vi.fn()}
        emptyMessage="No items"
      />
    );

    expect(screen.getByText('No items')).toBeDefined();
  });

  it('renders rows and columns', () => {
    render(
      <CrudTable<Item>
        columns={columns}
        data={[{ id: 1, name: 'A' }, { id: 2, name: 'B' }]}
        loading={false}
        error={null}
        searchTerm=""
        onSearchChange={vi.fn()}
        sortField={null}
        sortOrder="asc"
        onSort={vi.fn()}
        currentPage={1}
        onPageChange={vi.fn()}
        itemsPerPage={10}
        onItemsPerPageChange={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('ID')).toBeDefined();
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('B')).toBeDefined();
  });

  it('shows loading indicator when loading', () => {
    render(
      <CrudTable<Item>
        columns={columns}
        data={[]}
        loading={true}
        error={null}
        searchTerm=""
        onSearchChange={vi.fn()}
        sortField={null}
        sortOrder="asc"
        onSort={vi.fn()}
        currentPage={1}
        onPageChange={vi.fn()}
        itemsPerPage={10}
        onItemsPerPageChange={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    expect(screen.getByText('Chargement...')).toBeDefined();
  });

  it('shows retry button when error is set', () => {
    const onRetry = vi.fn();
    render(
      <CrudTable<Item>
        columns={columns}
        data={[]}
        loading={false}
        error="Oops"
        searchTerm=""
        onSearchChange={vi.fn()}
        sortField={null}
        sortOrder="asc"
        onSort={vi.fn()}
        currentPage={1}
        onPageChange={vi.fn()}
        itemsPerPage={10}
        onItemsPerPageChange={vi.fn()}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Oops')).toBeDefined();
    fireEvent.click(screen.getByText('Réessayer'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('calls onSort when sortable header is clicked', () => {
    const onSort = vi.fn();
    render(
      <CrudTable<Item>
        columns={columns}
        data={[]}
        loading={false}
        error={null}
        searchTerm=""
        onSearchChange={vi.fn()}
        sortField={null}
        sortOrder="asc"
        onSort={onSort}
        currentPage={1}
        onPageChange={vi.fn()}
        itemsPerPage={10}
        onItemsPerPageChange={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('ID'));
    expect(onSort).toHaveBeenCalledWith('id');
  });

  it('calls onSearchChange when typing in search input', () => {
    const onSearchChange = vi.fn();
    render(
      <CrudTable<Item>
        columns={columns}
        data={[]}
        loading={false}
        error={null}
        searchTerm=""
        onSearchChange={onSearchChange}
        sortField={null}
        sortOrder="asc"
        onSort={vi.fn()}
        currentPage={1}
        onPageChange={vi.fn()}
        itemsPerPage={10}
        onItemsPerPageChange={vi.fn()}
        onRetry={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('Rechercher...');
    fireEvent.change(input, { target: { value: 'x' } });
    expect(onSearchChange).toHaveBeenCalledWith('x');
  });

  it('renders actions column when actions provided', () => {
    render(
      <CrudTable<Item>
        columns={columns}
        data={[{ id: 1, name: 'A' }]}
        loading={false}
        error={null}
        searchTerm=""
        onSearchChange={vi.fn()}
        sortField={null}
        sortOrder="asc"
        onSort={vi.fn()}
        currentPage={1}
        onPageChange={vi.fn()}
        itemsPerPage={10}
        onItemsPerPageChange={vi.fn()}
        onRetry={vi.fn()}
        actions={() => <button>Act</button>}
      />
    );

    expect(screen.getByText('Act')).toBeDefined();
  });
});
