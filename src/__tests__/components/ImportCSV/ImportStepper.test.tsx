import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImportStepper from '../../../components/ImportCSV/ImportStepper';

describe('components/ImportCSV/ImportStepper', () => {
  it('renders all steps', () => {
    render(<ImportStepper step={1} />);
    expect(screen.getByText('Fichier')).toBeDefined();
    expect(screen.getByText('Correspondance')).toBeDefined();
    expect(screen.getByText('Validation')).toBeDefined();
    expect(screen.getByText('Import')).toBeDefined();
  });

  it('marks first step as active', () => {
    render(<ImportStepper step={1} />);
    expect(screen.getByText('Fichier').className).toContain('text-blue-700');
  });
});
