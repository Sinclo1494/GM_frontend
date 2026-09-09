import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchableSelect from '../../components/common/SearchableSelect';

describe('components/common/SearchableSelect', () => {
  it('renders placeholder when no value selected', () => {
    render(
      <SearchableSelect
        value=""
        onChange={vi.fn()}
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ]}
        placeholder="Pick one"
      />
    );

    expect(screen.getByText('Pick one')).toBeDefined();
  });

  it('renders selected label', () => {
    render(
      <SearchableSelect
        value="1"
        onChange={vi.fn()}
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ]}
      />
    );

    expect(screen.getByText('One')).toBeDefined();
  });

  it('opens dropdown on click', () => {
    render(
      <SearchableSelect
        value=""
        onChange={vi.fn()}
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ]}
      />
    );

    fireEvent.click(screen.getByText('Sélectionner...'));
    expect(screen.getByText('One')).toBeDefined();
    expect(screen.getByText('Two')).toBeDefined();
  });

  it('filters options on search', () => {
    render(
      <SearchableSelect
        value=""
        onChange={vi.fn()}
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ]}
      />
    );

    fireEvent.click(screen.getByText('Sélectionner...'));
    const input = screen.getByPlaceholderText('Rechercher...');
    fireEvent.change(input, { target: { value: 'On' } });
    expect(screen.getByText('One')).toBeDefined();
    expect(screen.queryByText('Two')).toBeNull();
  });

  it('calls onChange when option selected', () => {
    const onChange = vi.fn();
    render(
      <SearchableSelect
        value=""
        onChange={onChange}
        options={[
          { value: '1', label: 'One' },
          { value: '2', label: 'Two' },
        ]}
      />
    );

    fireEvent.click(screen.getByText('Sélectionner...'));
    fireEvent.click(screen.getByText('One'));
    expect(onChange).toHaveBeenCalledWith('1');
  });
});
