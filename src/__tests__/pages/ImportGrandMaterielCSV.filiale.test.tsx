import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { mockAxios, localStorageMock } from "../test-utils";
import { AuthProvider } from "../../context/AuthProvider";
import GMImportCsvPage from "../../pages/ImportGrandMaterielCSV";

// Mock UploadZone with a clickable button (file input is hard to drive)
vi.mock("../../components/ImportCSV/UploadZone", () => ({
  default: ({ onFileSelected }: any) => (
    <div data-testid="upload-zone">
      <button
        onClick={() =>
          onFileSelected(
            new File(["a;b;c"], "test.csv", { type: "text/csv" })
          )
        }
      >
        Upload
      </button>
    </div>
  ),
}));

const AFFILIATE_USER = {
  id: 7,
  username: "affil",
  first_name: "Aff",
  last_name: "User",
  email: "aff@test.com",
  is_active: true,
  is_superuser: false,
  can_access_all_filiales: false,
  filiale: "F001",
  accessible_databases: ["F001"],
  permissions: ["import.grand_materiel"],
};

describe("ImportGrandMaterielCSV - preselected filiale (page reload)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    localStorageMock.setItem("token", "test-token");

    mockAxios.get.mockImplementation((url: string) => {
      if (url.includes("/users/me/")) {
        return Promise.resolve({ data: AFFILIATE_USER });
      }
      if (url.includes("/filiale/")) {
        return Promise.resolve({
          data: {
            results: [
              { code_filiale: "F001", libelle_filiale: "Filiale Une" },
            ],
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it("shows the Continue button once the affiliate user is loaded", async () => {
    render(
      <AuthProvider>
        <GMImportCsvPage />
      </AuthProvider>
    );

    // The affiliate user is fetched asynchronously: the page must still
    // preselect its own filiale and enable the Continue button.
    await waitFor(() => {
      expect(screen.getByText(/Filiale Une/)).toBeTruthy();
    });

    fireEvent.click(screen.getByText("Upload"));

    await waitFor(() => {
      expect(screen.getByText("test.csv")).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByText("Continuer")).toBeTruthy();
    });
  });
});
