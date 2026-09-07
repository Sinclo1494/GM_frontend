import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { resetAllMocks, mockAxios } from "../test-utils";
import ProfilePage from "../../pages/ProfilePage";
import { AuthProvider } from "../../context/AuthProvider";

// Mock user service
vi.mock("../../api/userService", () => ({
  getUserPreferences: vi.fn(),
  updateUserPreferences: vi.fn(),
  changePassword: vi.fn(),
}));

// Mock useAuth
vi.mock("../../context/useAuth", () => ({
  useAuth: () => ({
    logout: vi.fn(),
  }),
}));

// Mock PermissionContext
vi.mock("../../auth/PermissionContext", () => ({
  usePermissions: () => ({
    hasPermission: vi.fn(() => true),
    user: { id: 1, username: "test", permissions: [] },
    permissions: [],
    loading: false,
    hasAnyPermission: vi.fn(() => true),
    hasAllPermissions: vi.fn(() => true),
  }),
}));

// Mock SearchableSelect
vi.mock("../../components/common/SearchableSelect", () => ({
  default: ({ value, onChange, options }: any) => (
    <select
      data-testid="searchable-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options?.map((o: any) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  ),
}));

// Mock theme components
vi.mock("../../theme/components", () => ({
  components: {
    pageTitle: "page-title",
    pageDescription: "page-description",
    card: "card",
    cardHeader: "card-header",
    sectionTitle: "section-title",
    label: "label",
    input: "input",
    button: {
      primary: "btn-primary",
      danger: "btn-danger",
    },
  },
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    resetAllMocks();
    vi.clearAllMocks();
    mockAxios.get.mockResolvedValue({ data: {} });
    mockAxios.post.mockResolvedValue({ data: {} });
    mockAxios.patch.mockResolvedValue({ data: {} });
  });

  const renderProfile = () =>
    render(
      <AuthProvider>
        <ProfilePage />
      </AuthProvider>
    );

  it("renders loading state initially", async () => {
    const { getUserPreferences } = await import("../../api/userService");
    vi.mocked(getUserPreferences).mockImplementation(() => new Promise(() => {}));
    renderProfile();
    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("renders profile content after loading", async () => {
    const { getUserPreferences } = await import("../../api/userService");
    vi.mocked(getUserPreferences).mockResolvedValue({
      default_landing_page: "",
      remember_last_visited_page: false,
      last_visited_page: "",
    });
    renderProfile();
    await waitFor(() => {
      expect(screen.getByText("Profil")).toBeTruthy();
    });
    expect(screen.getByText("Préférences de navigation")).toBeTruthy();
    expect(screen.getByText("Sécurité")).toBeTruthy();
  });

  it("renders save preferences button", async () => {
    const { getUserPreferences } = await import("../../api/userService");
    vi.mocked(getUserPreferences).mockResolvedValue({
      default_landing_page: "",
      remember_last_visited_page: false,
      last_visited_page: "",
    });
    renderProfile();
    await waitFor(() => {
      expect(screen.getByText("Enregistrer")).toBeTruthy();
    });
  });

  it("renders change password form", async () => {
    const { getUserPreferences } = await import("../../api/userService");
    vi.mocked(getUserPreferences).mockResolvedValue({
      default_landing_page: "",
      remember_last_visited_page: false,
      last_visited_page: "",
    });
    renderProfile();
    await waitFor(() => {
      expect(screen.getByText("Changer le mot de passe")).toBeTruthy();
    });
    // Password inputs are not associated with labels via htmlFor, so we query by form structure
    const inputs = document.querySelectorAll('input[type="password"]');
    expect(inputs.length).toBe(3);
  });
});
