import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EntityFormDialog from '../../components/Crud/EntityFormDialog';

describe('components/Crud/EntityFormDialog', () => {
  it('does not render when closed', () => {
    render(
      <EntityFormDialog
        open={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        fields={[]}
        initialValues={{}}
        error={null}
        title="Test"
      />
    );

    expect(screen.queryByText('Test')).toBeNull();
  });

  it('renders title and fields when open', () => {
    render(
      <EntityFormDialog
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        fields={[
          { name: 'name', label: 'Name', type: 'text' },
          { name: 'active', label: 'Active', type: 'checkbox' },
        ]}
        initialValues={{ name: 'X', active: true }}
        error={null}
        title="Create"
      />
    );

    expect(screen.getByText('Create')).toBeDefined();
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Active')).toBeDefined();
  });

  it('calls onSubmit with form values on submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <EntityFormDialog
        open={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        fields={[
          { name: 'name', label: 'Name', type: 'text' },
        ]}
        initialValues={{ name: 'X' }}
        error={null}
        title="Create"
      />
    );

    fireEvent.click(screen.getByText('Enregistrer'));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: 'X' });
    });
  });

  it('calls onClose when cancel button clicked', () => {
    const onClose = vi.fn();
    render(
      <EntityFormDialog
        open={true}
        onClose={onClose}
        onSubmit={vi.fn()}
        fields={[]}
        initialValues={{}}
        error={null}
        title="Create"
      />
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('displays error message when provided', () => {
    render(
      <EntityFormDialog
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        fields={[]}
        initialValues={{}}
        error="Something went wrong"
        title="Create"
      />
    );

    expect(screen.getByText('Something went wrong')).toBeDefined();
  });

  it('shows submit label when provided', () => {
    render(
      <EntityFormDialog
        open={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        fields={[]}
        initialValues={{}}
        error={null}
        title="Create"
        submitLabel="Save"
      />
    );

    expect(screen.getByText('Save')).toBeDefined();
  });
});
