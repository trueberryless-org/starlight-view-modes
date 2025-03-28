import { describe, expect, vi, afterEach, test } from "vitest";

// Helper function to mock astroConfig.base
function mockAstroConfigBase(base: string = "", trailingSlash: "never" | "always" | "ignore" = "ignore") {
  vi.doMock("virtual:starlight-view-modes-context", () => ({
    default: { base, trailingSlash: trailingSlash },
  }));
}

function mockConfig() {
  vi.doMock("virtual:starlight-view-modes-config", () => ({
    default: {
      zenModeSettings: {
        exclude: [],
      },
    },
  }));
}

// Import the function AFTER mocking
async function importAppendModePathname() {
  return (await import("../libs/utils")).insertModePathname;
}
async function importGetCurrentModeFromPath() {
  return (await import("../libs/utils")).getCurrentModeFromPath;
}

afterEach(() => {
  vi.resetModules();
});

describe("getCurrentModeFromPath", () => {
  test("returns 'default' when no mode is present", async () => {
    mockAstroConfigBase("");
    mockConfig();

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs")).toBe("default");
    expect(await getCurrentModeFromPath("/docs/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/")).toBe("default");
  });

  test("returns the correct mode when a mode is present", async () => {
    mockAstroConfigBase("");
    mockConfig();

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/zen-mode/intro")).toBe("zen-mode");
    // expect(await getCurrentModeFromPath("/presentation-mode/guide")).toBe("presentation-mode");
  });

  test("returns 'default' when the mode is not in AVAILABLE_MODES", async () => {
    mockAstroConfigBase("");
    mockConfig();

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/invalid-mode/intro")).toBe("default");
  });

  test("handles cases where base is '/docs'", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs/zen-mode/intro")).toBe(
      "zen-mode"
    );
    // expect(await getCurrentModeFromPath("/docs/presentation-mode/guide")).toBe("presentation-mode");
    expect(await getCurrentModeFromPath("/docs/intro")).toBe("default");
  });

  test("returns 'default' when the base is set but the mode is not at the start", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/notdocs/zen-mode/intro")).toBe(
      "default"
    );
  });

  test("handles trailing and leading slashes correctly", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs/zen-mode/")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/docs/zen-mode")).toBe("zen-mode");
  });

  test("returns 'default' when the mode is not at the start of the slug", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs/intro/zen-mode")).toBe(
      "default"
    );
  });
});

describe("insertModePathname", () => {
  test("should work with base set to ''", async () => {
    mockAstroConfigBase();
    mockConfig();

    const insertModePathname = await importAppendModePathname();
    
    expect(insertModePathname("/page/", "dark")).toBe("/dark/page/");
    expect(insertModePathname("/page", "dark")).toBe("/dark/page");
    expect(insertModePathname("page/", "dark")).toBe("dark/page/");
    expect(insertModePathname("page", "dark")).toBe("dark/page");
    expect(insertModePathname("/", "dark")).toBe("/dark/");
    expect(insertModePathname("", "dark")).toBe("dark/");
  });
  
  test("should work with base set to '/docs'", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();

    const insertModePathname = await importAppendModePathname();
    
    expect(insertModePathname("/docs/page/", "dark")).toBe("/docs/dark/page/");
    expect(insertModePathname("/docs/page", "dark")).toBe("/docs/dark/page");
    expect(insertModePathname("docs/page/", "dark")).toBe("docs/dark/page/");
    expect(insertModePathname("docs/page", "dark")).toBe("docs/dark/page");
    expect(insertModePathname("docs/", "dark")).toBe("docs/dark/");
    expect(insertModePathname("docs", "dark")).toBe("docs/dark");
  });
  
  test("should work with base set to '', appending 'default' mode returns same pathname", async () => {
    mockAstroConfigBase();
    mockConfig();

    const insertModePathname = await importAppendModePathname();
    
    expect(insertModePathname("/page/", "default")).toBe("/page/");
    expect(insertModePathname("/page", "default")).toBe("/page");
    expect(insertModePathname("page/", "default")).toBe("page/");
    expect(insertModePathname("page", "default")).toBe("page");
    expect(insertModePathname("/", "default")).toBe("/");
    expect(insertModePathname("", "default")).toBe("");
  });
  
  test("should work with base set to '/docs', appending 'default' mode returns same pathname", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();

    const insertModePathname = await importAppendModePathname();
    
    expect(insertModePathname("/docs/page/", "default")).toBe("/docs/page/");
    expect(insertModePathname("/docs/page", "default")).toBe("/docs/page");
    expect(insertModePathname("docs/page/", "default")).toBe("docs/page/");
    expect(insertModePathname("docs/page", "default")).toBe("docs/page");
    expect(insertModePathname("docs/", "default")).toBe("docs/");
    expect(insertModePathname("docs", "default")).toBe("docs");
  });
});
