import { describe, it, expect, vi, afterEach } from "vitest";

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

afterEach(() => {
  vi.resetModules();
});

describe("appendModePathname", () => {
  it("should work with base set to ''", async () => {
    mockAstroConfigBase();

    const appendModePathname = await importAppendModePathname();
    
    expect(appendModePathname("/page/", "dark")).toBe("/dark/page/");
    expect(appendModePathname("/page", "dark")).toBe("/dark/page");
    expect(appendModePathname("page/", "dark")).toBe("dark/page/");
    expect(appendModePathname("page", "dark")).toBe("dark/page");
  });
  
  it("should work with base set to '/docs'", async () => {
    mockAstroConfigBase("/docs");

    const appendModePathname = await importAppendModePathname();
    
    expect(appendModePathname("/docs/page/", "dark")).toBe("/docs/dark/page/");
    expect(appendModePathname("/docs/page", "dark")).toBe("/docs/dark/page");
    expect(appendModePathname("docs/page/", "dark")).toBe("docs/dark/page/");
    expect(appendModePathname("docs/page", "dark")).toBe("docs/dark/page");
  });
  
  it("should work with base set to '', appending 'default' mode returns same pathname", async () => {
    mockAstroConfigBase();

    const appendModePathname = await importAppendModePathname();
    
    expect(appendModePathname("/page/", "default")).toBe("/page/");
    expect(appendModePathname("/page", "default")).toBe("/page");
    expect(appendModePathname("page/", "default")).toBe("page/");
    expect(appendModePathname("page", "default")).toBe("page");
  });
  
  it("should work with base set to '/docs', appending 'default' mode returns same pathname", async () => {
    mockAstroConfigBase("/docs");

    const appendModePathname = await importAppendModePathname();
    
    expect(appendModePathname("/docs/page/", "default")).toBe("/docs/page/");
    expect(appendModePathname("/docs/page", "default")).toBe("/docs/page");
    expect(appendModePathname("docs/page/", "default")).toBe("docs/page/");
    expect(appendModePathname("docs/page", "default")).toBe("docs/page");
  });
});