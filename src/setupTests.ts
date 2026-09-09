import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------
afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Mock react-router-dom
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: () => null,
  Link: ({ children }: { children: React.ReactNode }) => children,
  Outlet: () => null,
  Navigate: () => null,
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

// ---------------------------------------------------------------------------
// Mock lucide-react
// ---------------------------------------------------------------------------
const LucideMock = () => null;
vi.mock('lucide-react', () => {
  const icons: Record<string, React.FC<any>> = {};
  const   names = [
    'Search', 'Plus', 'Trash2', 'Edit', 'Shield', 'Save', 'Lock', 'Upload',
    'CheckCircle2', 'Circle', 'AlertTriangle', 'ArrowLeft', 'ArrowRight',
    'FileText', 'FileSpreadsheet', 'ChevronDown', 'LogOut', 'Settings',
    'Sun', 'Moon', 'Loader2',
  ];
  names.forEach((name) => {
    icons[name] = LucideMock;
  });
  return icons;
});

// ---------------------------------------------------------------------------
// Mock axios globally
// ---------------------------------------------------------------------------
const mockAxios = {
  get: vi.fn(() => Promise.resolve({ data: null })),
  post: vi.fn(() => Promise.resolve({ data: null })),
  put: vi.fn(() => Promise.resolve({ data: null })),
  patch: vi.fn(() => Promise.resolve({ data: null })),
  delete: vi.fn(() => Promise.resolve({ data: null })),
  create: vi.fn(() => mockAxios),
  request: vi.fn(() => Promise.resolve({ data: null })),
  defaults: {},
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
};
vi.mock('axios', () => ({
  default: mockAxios,
  create: vi.fn(() => mockAxios),
}));

// ---------------------------------------------------------------------------
// localStorage stub
// ---------------------------------------------------------------------------
const localStorageData: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageData[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { localStorageData[key] = value; }),
  removeItem: vi.fn((key: string) => { delete localStorageData[key]; }),
  clear: vi.fn(() => { Object.keys(localStorageData).forEach((k) => delete localStorageData[k]); }),
  length: 0,
  key: vi.fn(),
};
vi.stubGlobal('localStorage', localStorageMock);

// ---------------------------------------------------------------------------
// Exported helpers
// ---------------------------------------------------------------------------
export { mockNavigate, mockAxios, localStorageMock, localStorageData };
