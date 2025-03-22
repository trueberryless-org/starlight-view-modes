import { describe, expect, vi, afterEach, test } from "vitest";

// Helper function to mock astroConfig.base
function mockAstroConfigBase(base: string = "", trailingSlash: "never" | "always" | "ignore" = "ignore") {
  vi.doMock("virtual:starlight-view-modes-context", () => ({
    default: { base, trailingSlash: trailingSlash },
  }));
}

// Import the function AFTER mocking
async function importAppendModePathname() {
  return (await import("../libs/modeClient")).appendModePathname;
}
async function importGetCurrentModeFromPath() {
  return (await import("../libs/modeClient")).getCurrentModeFromPath;
}

afterEach(() => {
  vi.resetModules();
});

describe("getCurrentModeFromPath", () => {
  test("returns 'default' when no mode is present", async () => {
    mockAstroConfigBase("");

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs")).toBe("default");
    expect(await getCurrentModeFromPath("/docs/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/")).toBe("default");
  });

  test("returns the correct mode when a mode is present", async () => {
    mockAstroConfigBase("");

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/zen-mode/intro")).toBe("zen-mode");
    // expect(await getCurrentModeFromPath("/presentation-mode/guide")).toBe("presentation-mode");
  });

  test("returns 'default' when the mode is not in AVAILABLE_MODES", async () => {
    mockAstroConfigBase("");

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/invalid-mode/intro")).toBe("default");
  });

  test("handles cases where base is '/docs'", async () => {
    mockAstroConfigBase("/docs");

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs/zen-mode/intro")).toBe(
      "zen-mode"
    );
    // expect(await getCurrentModeFromPath("/docs/presentation-mode/guide")).toBe("presentation-mode");
    expect(await getCurrentModeFromPath("/docs/intro")).toBe("default");
  });

  test("returns 'default' when the base is set but the mode is not at the start", async () => {
    mockAstroConfigBase("/docs");

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/notdocs/zen-mode/intro")).toBe(
      "default"
    );
  });

  test("handles trailing and leading slashes correctly", async () => {
    mockAstroConfigBase("/docs");

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs/zen-mode/")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/docs/zen-mode")).toBe("zen-mode");
  });

  test("returns 'default' when the mode is not at the start of the slug", async () => {
    mockAstroConfigBase("/docs");

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs/intro/zen-mode")).toBe(
      "default"
    );
  });
});

describe("appendModePathname", () => {
  test("should work with base set to ''", async () => {
    mockAstroConfigBase();

    const appendModePathname = await importAppendModePathname();
    
    expect(appendModePathname("/page/", "dark")).toBe("/dark/page/");
    expect(appendModePathname("/page", "dark")).toBe("/dark/page");
    expect(appendModePathname("page/", "dark")).toBe("dark/page/");
    expect(appendModePathname("page", "dark")).toBe("dark/page");
    expect(appendModePathname("/", "dark")).toBe("/dark/");
    expect(appendModePathname("", "dark")).toBe("dark/");
  });
  
  test("should work with base set to '/docs'", async () => {
    mockAstroConfigBase("/docs");

    const appendModePathname = await importAppendModePathname();
    
    expect(appendModePathname("/docs/page/", "dark")).toBe("/docs/dark/page/");
    expect(appendModePathname("/docs/page", "dark")).toBe("/docs/dark/page");
    expect(appendModePathname("docs/page/", "dark")).toBe("docs/dark/page/");
    expect(appendModePathname("docs/page", "dark")).toBe("docs/dark/page");
    expect(appendModePathname("docs/", "dark")).toBe("docs/dark/");
    expect(appendModePathname("docs", "dark")).toBe("docs/dark");
  });
  
  test("should work with base set to '', appending 'default' mode returns same pathname", async () => {
    mockAstroConfigBase();

    const appendModePathname = await importAppendModePathname();
    
    expect(appendModePathname("/page/", "default")).toBe("/page/");
    expect(appendModePathname("/page", "default")).toBe("/page");
    expect(appendModePathname("page/", "default")).toBe("page/");
    expect(appendModePathname("page", "default")).toBe("page");
    expect(appendModePathname("/", "default")).toBe("/");
    expect(appendModePathname("", "default")).toBe("");
  });
  
  test("should work with base set to '/docs', appending 'default' mode returns same pathname", async () => {
    mockAstroConfigBase("/docs");

    const appendModePathname = await importAppendModePathname();
    
    expect(appendModePathname("/docs/page/", "default")).toBe("/docs/page/");
    expect(appendModePathname("/docs/page", "default")).toBe("/docs/page");
    expect(appendModePathname("docs/page/", "default")).toBe("docs/page/");
    expect(appendModePathname("docs/page", "default")).toBe("docs/page");
    expect(appendModePathname("docs/", "default")).toBe("docs/");
    expect(appendModePathname("docs", "default")).toBe("docs");
  });
});
