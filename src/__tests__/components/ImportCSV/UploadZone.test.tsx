import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadZone from '../../../components/ImportCSV/UploadZone';

describe('components/ImportCSV/UploadZone', () => {
  it('renders upload prompt', () => {
    render(<UploadZone onFileSelected={vi.fn()} />);
    expect(screen.getByText('Déposez votre fichier CSV ici')).toBeDefined();
    expect(screen.getByText('ou cliquez pour sélectionner un fichier')).toBeDefined();
  });

  it('calls onFileSelected with a CSV file on input change', () => {
    const onFileSelected = vi.fn();
    render(<UploadZone onFileSelected={onFileSelected} />);

    const file = new File(['a,b,c'], 'test.csv', { type: 'text/csv' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    fireEvent.change(input, event);
    expect(onFileSelected).toHaveBeenCalledWith(file);
  });
});
