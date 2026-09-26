import { afterEach, describe, expect, test, vi } from "vitest";

import { mockAstroConfigBase, mockConfig, resetMocks } from "./mocks";

async function importZenMode() {
  vi.doMock("astro:content", () => ({}));
  mockAstroConfigBase();
  mockConfig();

  return await import("../libs/zenMode");
}

afterEach(() => {
  resetMocks();
});

describe("resolveZenModeClasses", () => {
  test("returns the classes for the default display options", async () => {
    const { resolveZenModeClasses } = await importZenMode();

    expect(
      resolveZenModeClasses({
        showHeader: false,
        showSidebar: false,
        showTableOfContents: true,
        showFooter: true,
      })
    ).toEqual([
      "starlight-view-modes-zen-mode-table-of-contents-footer",
      "starlight-view-modes-zen-mode-no-header",
      "starlight-view-modes-zen-mode-no-sidebar",
    ]);
  });

  test("returns the base class when all elements are hidden", async () => {
    const { resolveZenModeClasses } = await importZenMode();

    expect(
      resolveZenModeClasses({
        showHeader: false,
        showSidebar: false,
        showTableOfContents: false,
        showFooter: false,
      })
    ).toEqual([
      "starlight-view-modes-zen-mode",
      "starlight-view-modes-zen-mode-no-header",
      "starlight-view-modes-zen-mode-no-sidebar",
      "starlight-view-modes-zen-mode-no-table-of-contents",
      "starlight-view-modes-zen-mode-no-footer",
    ]);
  });
});

describe("resolveZenModeFrontmatter", () => {
  test("disables Pagefind indexing", async () => {
    const { resolveZenModeFrontmatter } = await importZenMode();

    expect(
      resolveZenModeFrontmatter({ title: "Intro" }, undefined)
    ).toEqual({ title: "Intro", pagefind: false });
  });

  test("prefixes internal hero action links", async () => {
    const { resolveZenModeFrontmatter } = await importZenMode();

    expect(
      resolveZenModeFrontmatter(
        {
          title: "Home",
          hero: {
            actions: [
              { text: "Start", link: "/getting-started/" },
              { text: "Starlight", link: "https://starlight.astro.build/" },
              { text: "Mail", link: "mailto:hello@example.com" },
            ],
          },
        },
        { html: "👀" }
      ).hero
    ).toEqual({
      actions: [
        { text: "Start", link: "/zen-mode/getting-started/" },
        { text: "Starlight", link: "https://starlight.astro.build/" },
        { text: "Mail", link: "mailto:hello@example.com" },
      ],
      image: { html: "👀" },
    });
  });
});
