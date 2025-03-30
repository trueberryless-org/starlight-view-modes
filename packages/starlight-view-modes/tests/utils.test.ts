import { describe, expect, vi, afterEach, test } from "vitest";

function mockStarlightConfig(config: any) {
  vi.doMock("virtual:starlight/user-config", () => ({
    default: config,
  }));
}

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
async function importInsertModePathname() {
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
    mockStarlightConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs")).toBe("default");
    expect(await getCurrentModeFromPath("/docs/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/")).toBe("default");
  });

  test("returns 'default' when no mode is present; with locales", async () => {
    mockAstroConfigBase("");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs")).toBe("default");
    expect(await getCurrentModeFromPath("/en/docs")).toBe("default");
    expect(await getCurrentModeFromPath("/de/docs")).toBe("default");
    expect(await getCurrentModeFromPath("/fr/docs")).toBe("default");
    expect(await getCurrentModeFromPath("/ru/docs")).toBe("default"); // Russian is not configured as a locale
    expect(await getCurrentModeFromPath("/docs/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/en/docs/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/de/docs/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/fr/docs/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/ru/docs/intro")).toBe("default"); // Russian is not configured as a locale
    expect(await getCurrentModeFromPath("/")).toBe("default");
    expect(await getCurrentModeFromPath("/en/")).toBe("default");
    expect(await getCurrentModeFromPath("/de/")).toBe("default");
    expect(await getCurrentModeFromPath("/fr/")).toBe("default");
    expect(await getCurrentModeFromPath("/ru/")).toBe("default"); // Russian is not configured as a locale
  });

  test("returns the correct mode when a mode is present", async () => {
    mockAstroConfigBase("");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/zen-mode/intro")).toBe("zen-mode");
  });

  test("returns the correct mode when a mode is present; with locales", async () => {
    mockAstroConfigBase("");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/zen-mode/intro")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/en/zen-mode/intro")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/de/zen-mode/intro")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/fr/zen-mode/intro")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/ru/zen-mode/intro")).toBe("default"); // Russian is not configured as a locale
  });

  test("returns 'default' when the mode is not in AVAILABLE_MODES", async () => {
    mockAstroConfigBase("");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/invalid-mode/intro")).toBe("default");
  });

  test("returns 'default' when the mode is not in AVAILABLE_MODES; with locales", async () => {
    mockAstroConfigBase("");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/invalid-mode/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/en/invalid-mode/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/de/invalid-mode/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/fr/invalid-mode/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/ru/invalid-mode/intro")).toBe("default"); // Russian is not configured as a locale
  });

  test("handles cases where base is '/docs'", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/docs/zen-mode/intro")).toBe(
      "zen-mode"
    );
  });

  test("handles cases where base is '/docs'; with locales", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/docs/en/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/docs/de/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/docs/fr/intro")).toBe("default");
    expect(await getCurrentModeFromPath("/docs/ru/intro")).toBe("default"); // Russian is not configured as a locale
    expect(await getCurrentModeFromPath("/docs/zen-mode/intro")).toBe(
      "zen-mode"
    );
    expect(await getCurrentModeFromPath("/docs/en/zen-mode/intro")).toBe(
      "zen-mode"
    );
    expect(await getCurrentModeFromPath("/docs/de/zen-mode/intro")).toBe(
      "zen-mode"
    );
    expect(await getCurrentModeFromPath("/docs/fr/zen-mode/intro")).toBe(
      "zen-mode"
    );
    expect(await getCurrentModeFromPath("/docs/ru/zen-mode/intro")).toBe(
      "default"
    ); // Russian is not configured as a locale
  });

  test("returns 'default' when the base is wrong", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/notdocs/zen-mode/intro")).toBe(
      "default"
    );
  });

  test("returns 'default' when the base is wrong; with locales", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/notdocs/zen-mode/intro")).toBe(
      "default"
    );
    expect(await getCurrentModeFromPath("/notdocs/en/zen-mode/intro")).toBe(
      "default"
    );
    expect(await getCurrentModeFromPath("/notdocs/de/zen-mode/intro")).toBe(
      "default"
    );
    expect(await getCurrentModeFromPath("/notdocs/fr/zen-mode/intro")).toBe(
      "default"
    );
    expect(await getCurrentModeFromPath("/notdocs/ru/zen-mode/intro")).toBe(
      "default"
    ); // Russian is not configured as a locale
  });

  test("handles trailing and leading slashes correctly", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs/zen-mode/")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/docs/zen-mode")).toBe("zen-mode");
  });

  test("handles trailing and leading slashes correctly; with locales", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs/zen-mode/")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/docs/en/zen-mode/")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/docs/de/zen-mode/")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/docs/fr/zen-mode/")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/docs/ru/zen-mode/")).toBe("default"); // Russian is not configured as a locale
    expect(await getCurrentModeFromPath("/docs/zen-mode")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/docs/en/zen-mode")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/docs/de/zen-mode")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/docs/fr/zen-mode")).toBe("zen-mode");
    expect(await getCurrentModeFromPath("/docs/ru/zen-mode")).toBe("default"); // Russian is not configured as a locale
  });

  test("returns 'default' when the mode is not at the start of the slug", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const getCurrentModeFromPath = await importGetCurrentModeFromPath();

    expect(await getCurrentModeFromPath("/docs/intro/zen-mode")).toBe(
      "default"
    );
  });

  test("returns 'default' when the mode is not at the start of the slug; with locales", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });
  
  
    const getCurrentModeFromPath = await importGetCurrentModeFromPath();
  
    expect(await getCurrentModeFromPath("/docs/intro/zen-mode")).toBe(
      "default"
    );
    expect(await getCurrentModeFromPath("/docs/en/intro/zen-mode")).toBe(
      "default"
    );
    expect(await getCurrentModeFromPath("/docs/de/intro/zen-mode")).toBe(
      "default"
    );
    expect(await getCurrentModeFromPath("/docs/fr/intro/zen-mode")).toBe(
      "default"
    );
    expect(await getCurrentModeFromPath("/docs/ru/intro/zen-mode")).toBe(
      "default"
    ); // Russian is not configured as a locale
  });
});


describe("insertModePathname", () => {
  test("should work with base set to ''", async () => {
    mockAstroConfigBase();
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const insertModePathname = await importInsertModePathname();
    
    expect(insertModePathname("/page/", "dark")).toBe("/dark/page/");
    expect(insertModePathname("/page", "dark")).toBe("/dark/page");
    expect(insertModePathname("page/", "dark")).toBe("dark/page/");
    expect(insertModePathname("page", "dark")).toBe("dark/page");
    expect(insertModePathname("/", "dark")).toBe("/dark/");
    expect(insertModePathname("", "dark")).toBe("dark/");
  });
  
  test("should work with base set to ''; with locales", async () => {
    mockAstroConfigBase();
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const insertModePathname = await importInsertModePathname();
    
    expect(insertModePathname("/page/", "dark")).toBe("/dark/page/");
    expect(insertModePathname("/en/page/", "dark")).toBe("/en/dark/page/");
    expect(insertModePathname("/de/page/", "dark")).toBe("/de/dark/page/");
    expect(insertModePathname("/fr/page/", "dark")).toBe("/fr/dark/page/");
    expect(insertModePathname("/ru/page/", "dark")).toBe("/dark/ru/page/"); // Russian is not configured as a locale
    expect(insertModePathname("/page", "dark")).toBe("/dark/page");
    expect(insertModePathname("/en/page", "dark")).toBe("/en/dark/page");
    expect(insertModePathname("/de/page", "dark")).toBe("/de/dark/page");
    expect(insertModePathname("/fr/page", "dark")).toBe("/fr/dark/page");
    expect(insertModePathname("/ru/page", "dark")).toBe("/dark/ru/page"); // Russian is not configured as a locale
    expect(insertModePathname("page/", "dark")).toBe("dark/page/");
    expect(insertModePathname("en/page/", "dark")).toBe("en/dark/page/");
    expect(insertModePathname("de/page/", "dark")).toBe("de/dark/page/");
    expect(insertModePathname("fr/page/", "dark")).toBe("fr/dark/page/");
    expect(insertModePathname("ru/page/", "dark")).toBe("dark/ru/page/"); // Russian is not configured as a locale
    expect(insertModePathname("page", "dark")).toBe("dark/page");
    expect(insertModePathname("en/page", "dark")).toBe("en/dark/page");
    expect(insertModePathname("de/page", "dark")).toBe("de/dark/page");
    expect(insertModePathname("fr/page", "dark")).toBe("fr/dark/page");
    expect(insertModePathname("ru/page", "dark")).toBe("dark/ru/page"); // Russian is not configured as a locale
    expect(insertModePathname("/", "dark")).toBe("/dark/");
    expect(insertModePathname("en/", "dark")).toBe("en/dark/");
    expect(insertModePathname("de/", "dark")).toBe("de/dark/");
    expect(insertModePathname("fr/", "dark")).toBe("fr/dark/");
    expect(insertModePathname("ru/", "dark")).toBe("dark/ru/"); // Russian is not configured as a locale
    expect(insertModePathname("/en", "dark")).toBe("/en/dark");
    expect(insertModePathname("/de", "dark")).toBe("/de/dark");
    expect(insertModePathname("/fr", "dark")).toBe("/fr/dark");
    expect(insertModePathname("/ru", "dark")).toBe("/dark/ru"); // Russian is not configured as a locale
    expect(insertModePathname("", "dark")).toBe("dark/");
    expect(insertModePathname("en", "dark")).toBe("en/dark");
    expect(insertModePathname("de", "dark")).toBe("de/dark");
    expect(insertModePathname("fr", "dark")).toBe("fr/dark");
    expect(insertModePathname("ru", "dark")).toBe("dark/ru"); // Russian is not configured as a locale
  });
  
  test("should work with base set to '/docs'", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const insertModePathname = await importInsertModePathname();
    
    expect(insertModePathname("/docs/page/", "dark")).toBe("/docs/dark/page/");
    expect(insertModePathname("/docs/page", "dark")).toBe("/docs/dark/page");
    expect(insertModePathname("docs/page/", "dark")).toBe("docs/dark/page/");
    expect(insertModePathname("docs/page", "dark")).toBe("docs/dark/page");
    expect(insertModePathname("docs/", "dark")).toBe("docs/dark/");
    expect(insertModePathname("docs", "dark")).toBe("docs/dark");
  });
  
  test("should work with base set to '/docs'; with locales", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const insertModePathname = await importInsertModePathname();
    
    expect(insertModePathname("/docs/page/", "dark")).toBe("/docs/dark/page/");
    expect(insertModePathname("/docs/en/page/", "dark")).toBe("/docs/en/dark/page/");
    expect(insertModePathname("/docs/de/page/", "dark")).toBe("/docs/de/dark/page/");
    expect(insertModePathname("/docs/fr/page/", "dark")).toBe("/docs/fr/dark/page/");
    expect(insertModePathname("/docs/ru/page/", "dark")).toBe("/docs/dark/ru/page/"); // Russian is not configured as a locale
    expect(insertModePathname("/docs/page", "dark")).toBe("/docs/dark/page");
    expect(insertModePathname("/docs/en/page", "dark")).toBe("/docs/en/dark/page");
    expect(insertModePathname("/docs/de/page", "dark")).toBe("/docs/de/dark/page");
    expect(insertModePathname("/docs/fr/page", "dark")).toBe("/docs/fr/dark/page");
    expect(insertModePathname("/docs/ru/page", "dark")).toBe("/docs/dark/ru/page"); // Russian is not configured as a locale
    expect(insertModePathname("docs/page/", "dark")).toBe("docs/dark/page/");
    expect(insertModePathname("docs/en/page/", "dark")).toBe("docs/en/dark/page/");
    expect(insertModePathname("docs/de/page/", "dark")).toBe("docs/de/dark/page/");
    expect(insertModePathname("docs/fr/page/", "dark")).toBe("docs/fr/dark/page/");
    expect(insertModePathname("docs/ru/page/", "dark")).toBe("docs/dark/ru/page/"); // Russian is not configured as a locale
    expect(insertModePathname("docs/page", "dark")).toBe("docs/dark/page");
    expect(insertModePathname("docs/en/page", "dark")).toBe("docs/en/dark/page");
    expect(insertModePathname("docs/de/page", "dark")).toBe("docs/de/dark/page");
    expect(insertModePathname("docs/fr/page", "dark")).toBe("docs/fr/dark/page");
    expect(insertModePathname("docs/ru/page", "dark")).toBe("docs/dark/ru/page"); // Russian is not configured as a locale
    expect(insertModePathname("docs/", "dark")).toBe("docs/dark/");
    expect(insertModePathname("docs/en/", "dark")).toBe("docs/en/dark/");
    expect(insertModePathname("docs/de/", "dark")).toBe("docs/de/dark/");
    expect(insertModePathname("docs/fr/", "dark")).toBe("docs/fr/dark/");
    expect(insertModePathname("docs/ru/", "dark")).toBe("docs/dark/ru/"); // Russian is not configured as a locale
    expect(insertModePathname("docs", "dark")).toBe("docs/dark");
    expect(insertModePathname("docs/en", "dark")).toBe("docs/en/dark");
    expect(insertModePathname("docs/de", "dark")).toBe("docs/de/dark");
    expect(insertModePathname("docs/fr", "dark")).toBe("docs/fr/dark");
    expect(insertModePathname("docs/ru", "dark")).toBe("docs/dark/ru"); // Russian is not configured as a locale
  });
  
  test("should work with base set to '', appending 'default' mode returns same pathname", async () => {
    mockAstroConfigBase();
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const insertModePathname = await importInsertModePathname();
    
    expect(insertModePathname("/page/", "default")).toBe("/page/");
    expect(insertModePathname("/page", "default")).toBe("/page");
    expect(insertModePathname("page/", "default")).toBe("page/");
    expect(insertModePathname("page", "default")).toBe("page");
    expect(insertModePathname("/", "default")).toBe("/");
    expect(insertModePathname("", "default")).toBe("");
  });
  
  test("should work with base set to '', appending 'default' mode returns same pathname; with locales", async () => {
    mockAstroConfigBase();
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const insertModePathname = await importInsertModePathname();
    
    expect(insertModePathname("/page/", "default")).toBe("/page/");
    expect(insertModePathname("/en/page/", "default")).toBe("/en/page/");
    expect(insertModePathname("/de/page/", "default")).toBe("/de/page/");
    expect(insertModePathname("/fr/page/", "default")).toBe("/fr/page/");
    expect(insertModePathname("/ru/page/", "default")).toBe("/ru/page/"); // Russian is not configured as a locale
    expect(insertModePathname("/page", "default")).toBe("/page");
    expect(insertModePathname("/en/page", "default")).toBe("/en/page");
    expect(insertModePathname("/de/page", "default")).toBe("/de/page");
    expect(insertModePathname("/fr/page", "default")).toBe("/fr/page");
    expect(insertModePathname("/ru/page", "default")).toBe("/ru/page"); // Russian is not configured as a locale
    expect(insertModePathname("page/", "default")).toBe("page/");
    expect(insertModePathname("en/page/", "default")).toBe("en/page/");
    expect(insertModePathname("de/page/", "default")).toBe("de/page/");
    expect(insertModePathname("fr/page/", "default")).toBe("fr/page/");
    expect(insertModePathname("ru/page/", "default")).toBe("ru/page/"); // Russian is not configured as a locale
    expect(insertModePathname("page", "default")).toBe("page");
    expect(insertModePathname("en/page", "default")).toBe("en/page");
    expect(insertModePathname("de/page", "default")).toBe("de/page");
    expect(insertModePathname("fr/page", "default")).toBe("fr/page");
    expect(insertModePathname("ru/page", "default")).toBe("ru/page"); // Russian is not configured as a locale
    expect(insertModePathname("/", "default")).toBe("/");
    expect(insertModePathname("en/", "default")).toBe("en/");
    expect(insertModePathname("de/", "default")).toBe("de/");
    expect(insertModePathname("fr/", "default")).toBe("fr/");
    expect(insertModePathname("ru/", "default")).toBe("ru/"); // Russian is not configured as a locale
    expect(insertModePathname("/en", "default")).toBe("/en");
    expect(insertModePathname("/de", "default")).toBe("/de");
    expect(insertModePathname("/fr", "default")).toBe("/fr");
    expect(insertModePathname("/ru", "default")).toBe("/ru"); // Russian is not configured as a locale
    expect(insertModePathname("", "default")).toBe("");
    expect(insertModePathname("en", "default")).toBe("en");
    expect(insertModePathname("de", "default")).toBe("de");
    expect(insertModePathname("fr", "default")).toBe("fr");
    expect(insertModePathname("ru", "default")).toBe("ru"); // Russian is not configured as a locale
  });
  
  test("should work with base set to '/docs', appending 'default' mode returns same pathname", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const insertModePathname = await importInsertModePathname();
    
    expect(insertModePathname("/docs/page/", "default")).toBe("/docs/page/");
    expect(insertModePathname("/docs/page", "default")).toBe("/docs/page");
    expect(insertModePathname("docs/page/", "default")).toBe("docs/page/");
    expect(insertModePathname("docs/page", "default")).toBe("docs/page");
    expect(insertModePathname("docs/", "default")).toBe("docs/");
    expect(insertModePathname("docs", "default")).toBe("docs");
  });
  
  test("should work with base set to '/docs', appending 'default' mode returns same pathname; with locales", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const insertModePathname = await importInsertModePathname();
    
    expect(insertModePathname("/docs/page/", "default")).toBe("/docs/page/");
    expect(insertModePathname("/docs/en/page/", "default")).toBe("/docs/en/page/");
    expect(insertModePathname("/docs/de/page/", "default")).toBe("/docs/de/page/");
    expect(insertModePathname("/docs/fr/page/", "default")).toBe("/docs/fr/page/");
    expect(insertModePathname("/docs/ru/page/", "default")).toBe("/docs/ru/page/"); // Russian is not configured as a locale
    expect(insertModePathname("/docs/page", "default")).toBe("/docs/page");
    expect(insertModePathname("/docs/en/page", "default")).toBe("/docs/en/page");
    expect(insertModePathname("/docs/de/page", "default")).toBe("/docs/de/page");
    expect(insertModePathname("/docs/fr/page", "default")).toBe("/docs/fr/page");
    expect(insertModePathname("/docs/ru/page", "default")).toBe("/docs/ru/page"); // Russian is not configured as a locale
    expect(insertModePathname("docs/page/", "default")).toBe("docs/page/");
    expect(insertModePathname("docs/en/page/", "default")).toBe("docs/en/page/");
    expect(insertModePathname("docs/de/page/", "default")).toBe("docs/de/page/");
    expect(insertModePathname("docs/fr/page/", "default")).toBe("docs/fr/page/");
    expect(insertModePathname("docs/ru/page/", "default")).toBe("docs/ru/page/"); // Russian is not configured as a locale
    expect(insertModePathname("docs/page", "default")).toBe("docs/page");
    expect(insertModePathname("docs/en/page", "default")).toBe("docs/en/page");
    expect(insertModePathname("docs/de/page", "default")).toBe("docs/de/page");
    expect(insertModePathname("docs/fr/page", "default")).toBe("docs/fr/page");
    expect(insertModePathname("docs/ru/page", "default")).toBe("docs/ru/page"); // Russian is not configured as a locale
    expect(insertModePathname("docs/", "default")).toBe("docs/");
    expect(insertModePathname("docs/en/", "default")).toBe("docs/en/");
    expect(insertModePathname("docs/de/", "default")).toBe("docs/de/");
    expect(insertModePathname("docs/fr/", "default")).toBe("docs/fr/");
    expect(insertModePathname("docs/ru/", "default")).toBe("docs/ru/"); // Russian is not configured as a locale
    expect(insertModePathname("docs", "default")).toBe("docs");
    expect(insertModePathname("docs/en", "default")).toBe("docs/en");
    expect(insertModePathname("docs/de", "default")).toBe("docs/de");
    expect(insertModePathname("docs/fr", "default")).toBe("docs/fr");
    expect(insertModePathname("docs/ru", "default")).toBe("docs/ru"); // Russian is not configured as a locale
  });
});
