import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { mockAxios, localStorageMock } from "../test-utils";
import { AuthProvider } from "../../context/AuthProvider";
import { useImportFiliale } from "../../hooks/useImportFiliale";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const buildUser = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  username: "user",
  first_name: "User",
  last_name: "Test",
  email: "user@test.com",
  is_active: true,
  is_superuser: false,
  can_access_all_filiales: false,
  filiale: "F001",
  accessible_databases: ["F001"],
  permissions: ["import.grand_materiel"],
  ...overrides,
});

describe("hooks/useImportFiliale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.setItem("token", "test-token");
  });

  const mockCurrentUser = (user: Record<string, unknown>) => {
    mockAxios.get.mockImplementation((url: string) => {
      if (url.includes("/users/me/")) {
        return Promise.resolve({ data: user });
      }
      return Promise.resolve({ data: [] });
    });
  };

  it("resolves the affiliate filiale once the user is loaded", async () => {
    mockCurrentUser(buildUser({ filiale: "F001" }));

    const { result } = renderHook(() => useImportFiliale(), { wrapper });

    // The user is fetched asynchronously: the hook must not stay empty.
    await waitFor(() => {
      expect(result.current.userFiliale).toBe("F001");
    });

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.selectedFiliale).toBe("F001");
  });

  it("keeps an empty affiliate when the user has no filiale", async () => {
    mockCurrentUser(buildUser({ filiale: null }));

    const { result } = renderHook(() => useImportFiliale(), { wrapper });

    await waitFor(() => {
      expect(result.current.userFiliale).toBeNull();
    });

    expect(result.current.selectedFiliale).toBe("");
  });

  it("lets a superuser select any filiale", async () => {
    mockCurrentUser(buildUser({ is_superuser: true, filiale: null }));

    const { result } = renderHook(() => useImportFiliale(), { wrapper });

    await waitFor(() => {
      expect(result.current.isAdmin).toBe(true);
    });

    expect(result.current.selectedFiliale).toBe("");

    result.current.setSelectedFiliale("F002");

    await waitFor(() => {
      expect(result.current.selectedFiliale).toBe("F002");
    });
  });

  it("ignores a filiale selection for a non superuser", async () => {
    mockCurrentUser(buildUser({ filiale: "F001" }));

    const { result } = renderHook(() => useImportFiliale(), { wrapper });

    await waitFor(() => {
      expect(result.current.selectedFiliale).toBe("F001");
    });

    result.current.setSelectedFiliale("F002");

    await waitFor(() => {
      expect(result.current.selectedFiliale).toBe("F001");
    });
  });
});
