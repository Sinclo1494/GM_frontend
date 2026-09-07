import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PaginationControls from '../../components/common/PaginationControls';

describe('components/common/PaginationControls', () => {
  it('renders item count text', () => {
    render(
      <PaginationControls
        currentPage={1}
        totalPages={3}
        totalItems={25}
        itemsPerPage={10}
        onPageChange={vi.fn()}
        onItemsPerPageChange={vi.fn()}
      />
    );

    expect(screen.getByText((content, element) => content.startsWith('Affichage de'))).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();
    expect(screen.getByText('25')).toBeDefined();
  });

  it('calls onPageChange when page button clicked', () => {
    const onPageChange = vi.fn();
    render(
      <PaginationControls
        currentPage={1}
        totalPages={3}
        totalItems={25}
        itemsPerPage={10}
        onPageChange={onPageChange}
        onItemsPerPageChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('renders next/prev buttons', () => {
    render(
      <PaginationControls
        currentPage={2}
        totalPages={3}
        totalItems={25}
        itemsPerPage={10}
        onPageChange={vi.fn()}
        onItemsPerPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('Précédent')).toBeDefined();
    expect(screen.getByText('Suivant')).toBeDefined();
  });

  it('returns null when totalPages <= 1 and showItemCount is false', () => {
    const { container } = render(
      <PaginationControls
        currentPage={1}
        totalPages={1}
        totalItems={5}
        itemsPerPage={10}
        onPageChange={vi.fn()}
        onItemsPerPageChange={vi.fn()}
        showItemCount={false}
      />
    );

    expect(container.innerHTML).toBe('');
  });
});
