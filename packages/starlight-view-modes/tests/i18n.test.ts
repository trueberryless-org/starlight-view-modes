import { describe, expect, vi, afterEach, test } from "vitest";

function mockConfig(config: any) {
  vi.doMock("virtual:starlight/user-config", () => ({
    default: config,
  }));
}

async function importI18n() {
  return await import("../libs/i18n");
}

afterEach(() => {
  vi.resetModules();
});

describe("getLocales", () => {
  test("returns default locale when no mode is present", async () => {
    mockConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {} },
    });

    const { getLocales } = await importI18n();
    expect(getLocales()).toEqual(["en"]);
  });
  test("returns undefined when default locale is root", async () => {
    mockConfig({
      defaultLocale: { locale: "root", lang: "en" },
      locales: {root: {}},
    });

    const { getLocales } = await importI18n();
    expect(getLocales()).toEqual([undefined]);
  });

  test("returns available locales excluding default", async () => {
    mockConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocales } = await importI18n();
    expect(getLocales()).toEqual(["en", "de", "fr"]);
  });
});

describe("getLocalizedSlug", () => {
  test("returns same slug when locale matches", async () => {
    const { getLocalizedSlug } = await importI18n();
    expect(getLocalizedSlug("de/home", "de")).toBe("de/home");
  });

  test("removes old locale and replaces with new one", async () => {
    const { getLocalizedSlug } = await importI18n();
    expect(getLocalizedSlug("de/home", "fr")).toBe("fr/home");
  });

  test("adds locale when slug has none", async () => {
    const { getLocalizedSlug } = await importI18n();
    expect(getLocalizedSlug("home", "fr")).toBe("fr/home");
    expect(getLocalizedSlug("/home", "fr")).toBe("/fr/home");
  });

  test("removes locale when set to empty", async () => {
    const { getLocalizedSlug } = await importI18n();
    expect(getLocalizedSlug("de/home", "")).toBe("home");
  });
});

describe("getLocaleFromSlug", () => {
  test("returns locale if present in config", async () => {
    mockConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocaleFromSlug } = await importI18n();
    expect(getLocaleFromSlug("de/home")).toBe("de");
  });

  test("returns undefined if locale is not present", async () => {
    mockConfig({
      defaultLocale: { locale: "en", lang: "en" },
      locales: { en: {}, de: {}, fr: {} },
    });

    const { getLocaleFromSlug } = await importI18n();
    expect(getLocaleFromSlug("home")).toBeUndefined();
  });
});

describe("getTranslation", () => {
  test("returns translation for current locale", async () => {
    mockConfig({
      defaultLocale: { locale: "en", lang: "en" },
    });

    const { getTranslation } = await importI18n();
    const translations = { en: "Hello", de: "Hallo" };

    expect(getTranslation("de", translations, "/home", "title")).toBe("Hallo");
  });

  test("returns default translation if current locale is missing", async () => {
    mockConfig({
      defaultLocale: { locale: "en", lang: "en" },
    });

    const { getTranslation } = await importI18n();
    const translations = { en: "Hello" };

    expect(getTranslation("fr", translations, "/home", "title")).toBe("Hello");
  });

  test("throws error if default translation is missing", async () => {
    mockConfig({
      defaultLocale: { locale: "en", lang: "en" },
    });

    const { getTranslation } = await importI18n();
    const translations = { de: "Hallo" };

    expect(() => getTranslation("de", translations, "/home", "title")).toThrow();
  });
});
