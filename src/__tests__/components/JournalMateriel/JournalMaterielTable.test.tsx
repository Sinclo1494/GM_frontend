import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JournalMaterielTable from '../../../components/JournalMateriel/JournalMaterielTable';

describe('components/JournalMateriel/JournalMaterielTable', () => {
  it('renders table title', () => {
    render(<JournalMaterielTable />);
    expect(screen.getByText('Journal Matériel')).toBeDefined();
  });

  it('renders search input', () => {
    render(<JournalMaterielTable />);
    expect(screen.getByPlaceholderText('Rechercher...')).toBeDefined();
  });

  it('renders items per page selector', () => {
    render(<JournalMaterielTable />);
    expect(screen.getByText('Lignes :')).toBeDefined();
  });
});
