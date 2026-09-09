import { describe, it, expect } from "vitest";
import {
  PERMISSIONS,
  CATEGORY_LABELS,
  PERMISSION_CATEGORIES,
  PERMISSION_DEPENDENCIES,
  getPermissionsByCategory,
  getPermissionByRoute,
  getPermissionsByRoutes,
  getPermissionByKey,
  getAllDependencies,
  getDependentPermissions,
  type PermissionCategory,
  type PermissionDefinition,
} from "../../auth/permissions";

describe("permissions.ts constants", () => {
  it("PERMISSIONS is a non-empty array of well-formed PermissionDefinition objects", () => {
    expect(Array.isArray(PERMISSIONS)).toBe(true);
    expect(PERMISSIONS.length).toBeGreaterThan(0);
    PERMISSIONS.forEach((p: PermissionDefinition) => {
      expect(typeof p.key).toBe("string");
      expect(typeof p.label).toBe("string");
      expect(typeof p.category).toBe("string");
      expect(typeof p.route).toBe("string");
      expect(typeof p.hasRead).toBe("boolean");
      expect(typeof p.hasWrite).toBe("boolean");
    });
  });

  it("every permission key is unique", () => {
    const keys = PERMISSIONS.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every permission route is unique", () => {
    const routes = PERMISSIONS.map((p) => p.route);
    expect(new Set(routes).size).toBe(routes.length);
  });

  it("CATEGORY_LABELS covers every PermissionCategory", () => {
    const allCategories: PermissionCategory[] = [
      "administration",
      "analyse",
      "gestion",
      "import",
    ];
    allCategories.forEach((cat) => {
      expect(CATEGORY_LABELS[cat]).toBeDefined();
      expect(typeof CATEGORY_LABELS[cat]).toBe("string");
    });
  });

  it("PERMISSION_CATEGORIES lists exactly the four known categories", () => {
    const names = new Set(PERMISSION_CATEGORIES);
    expect([...names].sort()).toEqual(
      ["administration", "analyse", "gestion", "import"].sort(),
    );
  });

  it("every permission has a route that starts with '/'", () => {
    PERMISSIONS.forEach((p) => {
      expect(p.route.startsWith("/")).toBe(true);
    });
  });

  it("the dashboard permission maps to '/'", () => {
    const dash = getPermissionByKey("analyse.dashboard");
    expect(dash?.route).toBe("/");
  });
});

describe("getPermissionsByCategory", () => {
  it("returns only permissions matching the given category", () => {
    const gestion = getPermissionsByCategory("gestion");
    expect(gestion.length).toBeGreaterThan(0);
    gestion.forEach((p) => expect(p.category).toBe("gestion"));
  });

  it("returns an empty array for an unknown category", () => {
    // cast because the function accepts PermissionCategory; we test runtime safety
    const result = getPermissionsByCategory("unknown" as PermissionCategory);
    expect(result).toEqual([]);
  });

  it("returns all administration permissions", () => {
    const admin = getPermissionsByCategory("administration");
    expect(admin.length).toBe(2);
    expect(admin.map((p) => p.key)).toEqual([
      "administration.users",
      "administration.journalisation",
    ]);
  });
});

describe("getPermissionByRoute", () => {
  it("returns the permission for a known route", () => {
    const p = getPermissionByRoute("/gestion/entreprises");
    expect(p).toBeDefined();
    expect(p?.key).toBe("gestion.entreprises");
  });

  it("returns undefined for an unknown route", () => {
    expect(getPermissionByRoute("/does-not-exist")).toBeUndefined();
  });
});

describe("getPermissionsByRoutes", () => {
  it("returns permissions whose route is in the provided list", () => {
    const routes = ["/gestion/entreprises", "/gestion/filiales", "/admin/users"];
    const result = getPermissionsByRoutes(routes);
    const keys = result.map((p) => p.key).sort();
    expect(keys).toEqual(
      ["gestion.entreprises", "gestion.filiales", "administration.users"].sort(),
    );
    // every returned route must be one of the provided routes
    result.forEach((p) => expect(routes).toContain(p.route));
  });

  it("returns an empty array when no routes match", () => {
    expect(getPermissionsByRoutes(["/no/such/route"])).toEqual([]);
  });

  it("preserves input order independence (dedup not required)", () => {
    const result = getPermissionsByRoutes(["/gestion/sites"]);
    expect(result).toHaveLength(1);
  });
});

describe("getPermissionByKey", () => {
  it("returns the permission for a known key", () => {
    const p = getPermissionByKey("import.pointage");
    expect(p).toBeDefined();
    expect(p?.label).toBe("Import Pointage");
  });

  it("returns undefined for an unknown key", () => {
    expect(getPermissionByKey("nope.nope")).toBeUndefined();
  });
});

describe("getAllDependencies", () => {
  it("returns direct dependencies for a key that has them", () => {
    const deps = getAllDependencies("import.site");
    // import.site depends on gestion.filiales.read and gestion.divisions.read
    expect(deps).toContain("gestion.filiales.read");
    expect(deps).toContain("gestion.divisions.read");
  });

  it("returns an empty array for a key with no dependencies", () => {
    expect(getAllDependencies("gestion.entreprises")).toEqual([]);
  });

  it("returns an empty array for an unknown key", () => {
    expect(getAllDependencies("unknown.key")).toEqual([]);
  });

  it("resolves transitive dependencies (recursive)", () => {
    // import.regularisation depends on gestion.filiales.read + gestion.sites.read
    // gestion.sites.read is not itself a key in PERMISSION_DEPENDENCIES, so no further expansion
    const deps = getAllDependencies("import.regularisation");
    expect(deps).toContain("gestion.filiales.read");
    expect(deps).toContain("gestion.sites.read");
    // no duplicates
    expect(new Set(deps).size).toBe(deps.length);
  });
});

describe("getDependentPermissions", () => {
  it("returns keys that depend on the given permission", () => {
    const dependents = getDependentPermissions("gestion.filiales.read");
    // Many imports depend on gestion.filiales.read
    expect(dependents.length).toBeGreaterThan(0);
    expect(dependents).toContain("analyse.dashboard");
    expect(dependents).toContain("import.grand_materiel");
  });

  it("returns an empty array for a permission nobody depends on", () => {
    const dependents = getDependentPermissions("analyse.dashboard");
    // No other permission lists analyse.dashboard as a dependency
    expect(dependents).toEqual([]);
  });

  it("matches both exact and .read/.write suffixes via base key", () => {
    // import.site dependency "gestion.filiales.read"; base key "gestion.filiales"
    const dependents = getDependentPermissions("gestion.filiales");
    expect(dependents).toContain("import.site");
  });

  it("returns an empty array for an unknown permission", () => {
    expect(getDependentPermissions("unknown.thing")).toEqual([]);
  });
});

describe("PERMISSION_DEPENDENCIES integrity", () => {
  it("every referenced dependency maps to a real gestion/analyse/import permission", () => {
    const allKeys = new Set(PERMISSIONS.map((p) => p.key));
    Object.values(PERMISSION_DEPENDENCIES).forEach((deps) => {
      deps.forEach((d) => {
        const base = d.replace(/\.read$/, "").replace(/\.write$/, "");
        expect(allKeys.has(base)).toBe(true);
      });
    });
  });
});
