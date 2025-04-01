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

async function importI18n() {
  return await import("../libs/i18n");
}

afterEach(() => {
  vi.resetModules();
});


describe("getLocalizedSlug", () => {
  test("returns same slug when locale matches", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocalizedSlug } = await importI18n();
    expect(getLocalizedSlug("de/home", "de")).toBe("de/home");
    expect(getLocalizedSlug("fr/home", "fr")).toBe("fr/home");
    expect(getLocalizedSlug("fr/home", "ru")).toBe("fr/home");
    expect(getLocalizedSlug("ru/home", "fr")).toBe("fr/ru/home");
    expect(getLocalizedSlug("ru/home", "ru")).toBe("ru/home");
    expect(getLocalizedSlug("/de/home", "de")).toBe("/de/home");
    expect(getLocalizedSlug("de/home/", "de")).toBe("de/home/");
    expect(getLocalizedSlug("/de/home/", "de")).toBe("/de/home/");
    expect(getLocalizedSlug("/de/some/long/path/", "de")).toBe("/de/some/long/path/");
  });
  
  test("returns same slug when locale matches; with base option", async () => {
    mockAstroConfigBase("/docs");
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocalizedSlug } = await importI18n();
    expect(getLocalizedSlug("docs/de/home", "de")).toBe("docs/de/home");
    expect(getLocalizedSlug("docs/fr/home", "fr")).toBe("docs/fr/home");
    expect(getLocalizedSlug("docs/fr/home", "ru")).toBe("docs/fr/home");
    expect(getLocalizedSlug("docs/ru/home", "fr")).toBe("docs/fr/ru/home");
    expect(getLocalizedSlug("docs/ru/home", "ru")).toBe("docs/ru/home");
    expect(getLocalizedSlug("/docs/de/home", "de")).toBe("/docs/de/home");
    expect(getLocalizedSlug("docs/de/home/", "de")).toBe("docs/de/home/");
    expect(getLocalizedSlug("/docs/de/home/", "de")).toBe("/docs/de/home/");
    expect(getLocalizedSlug("/docs/de/some/long/path/", "de")).toBe("/docs/de/some/long/path/");
  });

  test("removes old locale and replaces with new one", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocalizedSlug } = await importI18n();
    expect(getLocalizedSlug("de/home", "fr")).toBe("fr/home");
    expect(getLocalizedSlug("fr/home", "en")).toBe("en/home");
    expect(getLocalizedSlug("fr/home", "ru")).toBe("fr/home");
    expect(getLocalizedSlug("ru/home", "fr")).toBe("fr/ru/home");
    expect(getLocalizedSlug("ru/home", "ru")).toBe("ru/home");
    expect(getLocalizedSlug("de/home/", "fr")).toBe("fr/home/");
    expect(getLocalizedSlug("/de/home", "fr")).toBe("/fr/home");
    expect(getLocalizedSlug("/de/home/", "fr")).toBe("/fr/home/");
    expect(getLocalizedSlug("/de/some/long/path/", "fr")).toBe("/fr/some/long/path/");
  });

  test("removes old locale and replaces with new one; with base option", async () => {
    mockAstroConfigBase("/docs");
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocalizedSlug } = await importI18n();
    expect(getLocalizedSlug("docs/de/home", "fr")).toBe("docs/fr/home");
    expect(getLocalizedSlug("docs/fr/home", "en")).toBe("docs/en/home");
    expect(getLocalizedSlug("docs/fr/home", "ru")).toBe("docs/fr/home");
    expect(getLocalizedSlug("docs/ru/home", "fr")).toBe("docs/fr/ru/home");
    expect(getLocalizedSlug("docs/ru/home", "ru")).toBe("docs/ru/home");
    expect(getLocalizedSlug("docs/de/home/", "fr")).toBe("docs/fr/home/");
    expect(getLocalizedSlug("/docs/de/home", "fr")).toBe("/docs/fr/home");
    expect(getLocalizedSlug("/docs/de/home/", "fr")).toBe("/docs/fr/home/");
    expect(getLocalizedSlug("/docs/de/some/long/path/", "fr")).toBe("/docs/fr/some/long/path/");
  });

  test("adds locale when slug has none", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocalizedSlug } = await importI18n();
    expect(getLocalizedSlug("home", "de")).toBe("de/home");
    expect(getLocalizedSlug("home", "fr")).toBe("fr/home");
    expect(getLocalizedSlug("home", "ru")).toBe("home");
    expect(getLocalizedSlug("/home", "de")).toBe("/de/home");
    expect(getLocalizedSlug("home/", "de")).toBe("de/home/");
    expect(getLocalizedSlug("/home/", "de")).toBe("/de/home/");
    expect(getLocalizedSlug("/some/long/path/", "de")).toBe("/de/some/long/path/");
  });

  test("adds locale when slug has none; with base option", async () => {
    mockAstroConfigBase("/docs");
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocalizedSlug } = await importI18n();
    expect(getLocalizedSlug("docs/home", "de")).toBe("docs/de/home");
    expect(getLocalizedSlug("docs/home", "fr")).toBe("docs/fr/home");
    expect(getLocalizedSlug("docs/home", "ru")).toBe("docs/home");
    expect(getLocalizedSlug("/docs/home", "de")).toBe("/docs/de/home");
    expect(getLocalizedSlug("docs/home/", "de")).toBe("docs/de/home/");
    expect(getLocalizedSlug("/docs/home/", "de")).toBe("/docs/de/home/");
    expect(getLocalizedSlug("/docs/some/long/path/", "de")).toBe("/docs/de/some/long/path/");
  });

  test("removes locale when set to undefined", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });
    
    const { getLocalizedSlug } = await importI18n();
    expect(getLocalizedSlug("de/home", undefined)).toBe("home");
    expect(getLocalizedSlug("fr/home", undefined)).toBe("home");
    expect(getLocalizedSlug("ru/home", undefined)).toBe("ru/home");
    expect(getLocalizedSlug("de/home/", undefined)).toBe("home/");
    expect(getLocalizedSlug("/de/home", undefined)).toBe("/home");
    expect(getLocalizedSlug("/de/home/", undefined)).toBe("/home/");
    expect(getLocalizedSlug("/de/some/long/path/", undefined)).toBe("/some/long/path/");
  });

  test("removes locale when set to undefined; with base option", async () => {
    mockAstroConfigBase("/docs");
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });
    
    const { getLocalizedSlug } = await importI18n();
    expect(getLocalizedSlug("docs/de/home", undefined)).toBe("docs/home");
    expect(getLocalizedSlug("docs/fr/home", undefined)).toBe("docs/home");
    expect(getLocalizedSlug("docs/ru/home", undefined)).toBe("docs/ru/home");
    expect(getLocalizedSlug("docs/de/home/", undefined)).toBe("docs/home/");
    expect(getLocalizedSlug("/docs/de/home", undefined)).toBe("/docs/home");
    expect(getLocalizedSlug("/docs/de/home/", undefined)).toBe("/docs/home/");
    expect(getLocalizedSlug("/docs/de/some/long/path/", undefined)).toBe("/docs/some/long/path/");
  });
});

describe("getLocaleFromSlug", () => {
  test("returns locale if present in config", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocaleFromSlug } = await importI18n();
    expect(getLocaleFromSlug("de/home")).toBe("de");
    expect(getLocaleFromSlug("fr/home")).toBe("fr");
    expect(getLocaleFromSlug("de/home/")).toBe("de");
    expect(getLocaleFromSlug("/de/home")).toBe("de");
    expect(getLocaleFromSlug("/de/home/")).toBe("de");
    expect(getLocaleFromSlug("/de/some/long/path/")).toBe("de");
  });

  test("returns locale if present in config; with base option", async () => {
    mockAstroConfigBase("/docs");
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocaleFromSlug } = await importI18n();
    expect(getLocaleFromSlug("docs/de/home")).toBe("de");
    expect(getLocaleFromSlug("docs/fr/home")).toBe("fr");
    expect(getLocaleFromSlug("docs/de/home/")).toBe("de");
    expect(getLocaleFromSlug("/docs/de/home")).toBe("de");
    expect(getLocaleFromSlug("/docs/de/home/")).toBe("de");
    expect(getLocaleFromSlug("/docs/de/some/long/path/")).toBe("de");
  });

  test("returns undefined if locale is not present", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocaleFromSlug } = await importI18n();
    expect(getLocaleFromSlug("home")).toBeUndefined();
    expect(getLocaleFromSlug("ru/home")).toBeUndefined();
    expect(getLocaleFromSlug("home/en")).toBeUndefined();
    expect(getLocaleFromSlug("home/fr")).toBeUndefined();
    expect(getLocaleFromSlug("home/en/")).toBeUndefined();
    expect(getLocaleFromSlug("home/fr/")).toBeUndefined();
  });
  
  test("returns undefined if locale is not present; with base option", async () => {
    mockAstroConfigBase("/docs");
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocaleFromSlug } = await importI18n();
    expect(getLocaleFromSlug("docs/home")).toBeUndefined();
    expect(getLocaleFromSlug("docs/ru/home")).toBeUndefined();
    expect(getLocaleFromSlug("docs/home/en")).toBeUndefined();
    expect(getLocaleFromSlug("docs/home/fr")).toBeUndefined();
    expect(getLocaleFromSlug("docs/home/en/")).toBeUndefined();
    expect(getLocaleFromSlug("docs/home/fr/")).toBeUndefined();
  });
});

describe("getLocales", () => {
  test("returns default locale when no mode is present", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {} },
    });

    const { getLocales } = await importI18n();
    expect(getLocales()).toEqual(["en"]);
  });

  test("returns undefined when default locale is root", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const { getLocales } = await importI18n();
    expect(getLocales()).toEqual([undefined]);
  });

  test("returns available locales excluding default", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocales } = await importI18n();
    expect(getLocales()).toEqual(["en", "de", "fr"]);
  });
});

describe("getLocalizedExclude", () => {
  test("returns localized versions of exclude paths", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });
    const { getLocalizedExclude } = await importI18n();

    expect(getLocalizedExclude(["home", "about"])).toEqual([
      "en/home",
      "en/about",
      "de/home",
      "de/about",
      "fr/home",
      "fr/about",
    ]);
  });

  test("removes existing locale before localizing", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });
    const { getLocalizedExclude } = await importI18n();

    expect(getLocalizedExclude(["de/home", "fr/about"])).toEqual([
      "en/home",
      "en/about",
      "de/home",
      "de/about",
      "fr/home",
      "fr/about",
    ]);
  });

  test("handles paths with leading slashes correctly", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });
    const { getLocalizedExclude } = await importI18n();

    expect(getLocalizedExclude(["/contact", "/info"])).toEqual([
      "/en/contact",
      "/en/info",
      "/de/contact",
      "/de/info",
      "/fr/contact",
      "/fr/info",
    ]);
  });

  test("returns empty array when exclude list is empty", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });
    const { getLocalizedExclude } = await importI18n();

    expect(getLocalizedExclude([])).toEqual([]);
  });

  test("handles paths that already include locales", async () => {
    mockAstroConfigBase();
    mockStarlightConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });
    const { getLocalizedExclude } = await importI18n();

    expect(getLocalizedExclude(["en/blog", "de/news"])).toEqual([
      "en/blog",
      "en/news",
      "de/blog",
      "de/news",
      "fr/blog",
      "fr/news",
    ]);
  });
});
