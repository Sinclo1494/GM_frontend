import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MappingRow from '../../../components/ImportCSV/MappingRow';
import MappingStatus from '../../../components/ImportCSV/MappingStatus';
import MappingTable from '../../../components/ImportCSV/MappingTable';
import FileInformation from '../../../components/ImportCSV/FileInformation';
import ImportError from '../../../components/ImportCSV/ImportError';
import ImportSettings from '../../../components/ImportCSV/ImportSettings';
import ImportSuccess from '../../../components/ImportCSV/ImportSuccess';
import ValidationIssueTable from '../../../components/ImportCSV/ValidationIssueTable';
import ValidationProgress from '../../../components/ImportCSV/ValidationProgress';
import ValidationSummary from '../../../components/ImportCSV/ValidationSummary';

describe('components/ImportCSV/MappingRow', () => {
  it('renders index and label', () => {
    render(<MappingRow index={0} label="Name" value="name" onChange={vi.fn()} options={[]} />);
    expect(screen.getByText('Name')).toBeDefined();
  });
});

describe('components/ImportCSV/MappingStatus', () => {
  it('renders status text', () => {
    render(<MappingStatus status="ok" message="Good" />);
    expect(screen.getByText('Good')).toBeDefined();
  });
});

describe('components/ImportCSV/MappingTable', () => {
  it('renders mapping rows', () => {
    render(
      <MappingTable
        headers={['Name']}
        mappings={[{ index: 0, label: 'Name', value: 'name' }]}
        onChange={vi.fn()}
        options={{ name: [] }}
      />
    );
    expect(screen.getByText('Name')).toBeDefined();
  });
});

describe('components/ImportCSV/FileInformation', () => {
  it('renders file name and size', () => {
    render(<FileInformation file={{ name: 'x.csv', size: 1024, type: 'text/csv' }} />);
    expect(screen.getByText('x.csv')).toBeDefined();
    expect(screen.getByText('1 KB')).toBeDefined();
  });
});

describe('components/ImportCSV/ImportError', () => {
  it('renders error message', () => {
    render(<ImportError message="fail" />);
    expect(screen.getByText('fail')).toBeDefined();
  });
});

describe('components/ImportCSV/ImportSettings', () => {
  it('renders settings form', () => {
    render(<ImportSettings filiale="F1" filiales={[]} onFilialeChange={vi.fn()} onSubmit={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('Paramètres d\'import')).toBeDefined();
  });
});

describe('components/ImportCSV/ImportSuccess', () => {
  it('renders success summary', () => {
    render(<ImportSuccess imported={10} failed={0} onReset={vi.fn()} />);
    expect(screen.getByText('Import terminé')).toBeDefined();
  });
});

describe('components/ImportCSV/ValidationIssueTable', () => {
  it('renders validation issues', () => {
    render(<ValidationIssueTable issues={[{ row: 1, field: 'x', message: 'bad' }]} />);
    expect(screen.getByText('bad')).toBeDefined();
  });
});

describe('components/ImportCSV/ValidationProgress', () => {
  it('renders progress text', () => {
    render(<ValidationProgress progress={50} status="running" />);
    expect(screen.getByText('50%')).toBeDefined();
  });
});

describe('components/ImportCSV/ValidationSummary', () => {
  it('renders validation summary', () => {
    render(<ValidationSummary total={10} valid={8} invalid={2} onImport={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('Résumé de validation')).toBeDefined();
  });
});
