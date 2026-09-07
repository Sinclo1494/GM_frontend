import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JournalDetailDialog from '../../../components/Journalisation/JournalDetailDialog';

describe('components/Journalisation/JournalDetailDialog', () => {
  it('does not render when closed', () => {
    render(<JournalDetailDialog open={false} onClose={vi.fn()} journal={null} />);
    expect(screen.queryByText('Détail du journal')).toBeNull();
  });

  it('renders journal details when open', () => {
    render(
      <JournalDetailDialog
        open={true}
        onClose={vi.fn()}
        journal={{
          id: 1,
          model_name: 'grand_materiel',
          object_id: '1',
          action: 'create',
          data: { name: 'X' },
          user: 'admin',
          timestamp: '2024-01-01T00:00:00Z',
        }}
      />
    );

    expect(screen.getByText('Détail du journal')).toBeDefined();
    expect(screen.getByText('grand_materiel')).toBeDefined();
    expect(screen.getByText('admin')).toBeDefined();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <JournalDetailDialog
        open={true}
        onClose={onClose}
        journal={{
          id: 1,
          model_name: 'grand_materiel',
          object_id: '1',
          action: 'create',
          data: {},
          user: 'admin',
          timestamp: '2024-01-01T00:00:00Z',
        }}
      />
    );

    fireEvent.click(screen.getByText('✕'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
