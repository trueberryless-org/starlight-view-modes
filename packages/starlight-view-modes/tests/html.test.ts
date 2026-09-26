import { afterEach, describe, expect, test } from "vitest";

import { mockAstroConfigBase, mockConfig, resetMocks } from "./mocks";

async function importHtml() {
  return await import("../libs/html");
}

afterEach(() => {
  resetMocks();
});

describe("prefixInternalLinks", () => {
  test("prefixes internal links with the mode", async () => {
    mockAstroConfigBase();
    mockConfig();

    const { prefixInternalLinks } = await importHtml();

    expect(
      prefixInternalLinks('<p><a href="/guides/intro/">Intro</a></p>', "zen-mode")
    ).toBe('<p><a href="/zen-mode/guides/intro/">Intro</a></p>');
  });

  test("respects the base path", async () => {
    mockAstroConfigBase("/docs");
    mockConfig();

    const { prefixInternalLinks } = await importHtml();

    expect(
      prefixInternalLinks('<a href="/docs/guides/intro/">Intro</a>', "zen-mode")
    ).toBe('<a href="/docs/zen-mode/guides/intro/">Intro</a>');
  });

  test("does not prefix anchors, absolute URLs and ignored links", async () => {
    mockAstroConfigBase();
    mockConfig();

    const { prefixInternalLinks } = await importHtml();
    const html = [
      '<a href="#heading">Heading</a>',
      '<a href="https://starlight.astro.build/">Starlight</a>',
      '<a href="mailto:hello@example.com">Mail</a>',
      '<a href="tel:+123456789">Phone</a>',
      '<a href="/guides/intro/" view-modes-ignore="">Intro</a>',
    ].join("");

    expect(prefixInternalLinks(html, "zen-mode")).toBe(html);
  });
});
