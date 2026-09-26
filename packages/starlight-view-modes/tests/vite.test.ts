import { describe, expect, test } from "vitest";

import { getContext } from "../libs/vite";

const astroConfig = { base: "/docs", trailingSlash: "always" } as const;

describe("getContext", () => {
  test("returns no locales for a monolingual site", () => {
    expect(getContext({}, astroConfig)).toEqual({
      base: "/docs",
      trailingSlash: "always",
      defaultLocale: undefined,
      locales: [],
      pagefind: true,
    });
  });

  test("returns no locales for a monolingual site with a root locale", () => {
    expect(
      getContext(
        { locales: { root: { label: "Deutsch", lang: "de" } } },
        astroConfig
      )
    ).toMatchObject({ defaultLocale: undefined, locales: [] });
  });

  test("returns the locale keys for a multilingual site with a root locale", () => {
    expect(
      getContext(
        {
          locales: {
            root: { label: "English", lang: "en" },
            "zh-cn": { label: "简体中文", lang: "zh-CN" },
          },
        },
        astroConfig
      )
    ).toMatchObject({ defaultLocale: undefined, locales: ["root", "zh-cn"] });
  });

  test("returns the locale keys for a multilingual site with a default locale", () => {
    expect(
      getContext(
        {
          defaultLocale: "en",
          locales: {
            en: { label: "English", lang: "en" },
            "zh-cn": { label: "简体中文", lang: "zh-CN" },
          },
        },
        astroConfig
      )
    ).toMatchObject({ defaultLocale: "en", locales: ["en", "zh-cn"] });
  });

  test("returns the locale key for a monolingual site with a non-root locale", () => {
    expect(
      getContext(
        { defaultLocale: "fr", locales: { fr: { label: "Français" } } },
        astroConfig
      )
    ).toMatchObject({ defaultLocale: "fr", locales: ["fr"] });
  });

  test("disables Pagefind when explicitly disabled", () => {
    expect(getContext({ pagefind: false }, astroConfig)).toMatchObject({
      pagefind: false,
    });
  });

  test("disables Pagefind when prerendering is disabled", () => {
    expect(getContext({ prerender: false }, astroConfig)).toMatchObject({
      pagefind: false,
    });
  });

  test("enables Pagefind with a custom Pagefind configuration", () => {
    expect(
      getContext({ pagefind: { mergeIndex: [] } }, astroConfig)
    ).toMatchObject({ pagefind: true });
  });
});
