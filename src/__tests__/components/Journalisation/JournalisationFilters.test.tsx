import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JournalisationFilters from '../../../components/Journalisation/JournalisationFilters';

describe('components/Journalisation/JournalisationFilters', () => {
  it('renders filter inputs', () => {
    render(
      <JournalisationFilters
        filters={{ date_debut: '', date_fin: '', user: '', model_name: '', action: '', object_id: '' }}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onClear={vi.fn()}
        filiales={[]}
        loading={false}
      />
    );

    expect(screen.getByText('Date début')).toBeDefined();
    expect(screen.getByText('Date fin')).toBeDefined();
    expect(screen.getByText('Utilisateur')).toBeDefined();
  });

  it('calls onChange when filter input changes', () => {
    const onChange = vi.fn();
    render(
      <JournalisationFilters
        filters={{ date_debut: '', date_fin: '', user: '', model_name: '', action: '', object_id: '' }}
        onChange={onChange}
        onApply={vi.fn()}
        onClear={vi.fn()}
        filiales={[]}
        loading={false}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('ex: admin'), { target: { value: 'admin' } });
    expect(onChange).toHaveBeenCalledWith({ user: 'admin' });
  });

  it('calls onApply when apply button clicked', () => {
    const onApply = vi.fn();
    render(
      <JournalisationFilters
        filters={{ date_debut: '', date_fin: '', user: '', model_name: '', action: '', object_id: '' }}
        onChange={vi.fn()}
        onApply={onApply}
        onClear={vi.fn()}
        filiales={[]}
        loading={false}
      />
    );

    fireEvent.click(screen.getByText('Appliquer'));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when clear button clicked', () => {
    const onClear = vi.fn();
    render(
      <JournalisationFilters
        filters={{ date_debut: '', date_fin: '', user: '', model_name: '', action: '', object_id: '' }}
        onChange={vi.fn()}
        onApply={vi.fn()}
        onClear={onClear}
        filiales={[]}
        loading={false}
      />
    );

    fireEvent.click(screen.getByText('Réinitialiser'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
