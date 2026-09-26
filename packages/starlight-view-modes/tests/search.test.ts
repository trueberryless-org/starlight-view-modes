import { afterEach, describe, expect, test, vi } from "vitest";

import { mockAstroConfigBase, resetMocks } from "./mocks";

async function importSearch(enabled: boolean) {
  vi.doMock("astro:content", () => ({ getCollection: async () => [] }));
  vi.doMock("virtual:starlight-view-modes/config", () => ({
    default: {
      zenModeSettings: {
        enabled,
        exclude: [],
        keyboardShortcut: ["Ctrl+Shift+Z"],
      },
    },
  }));
  mockAstroConfigBase();

  return await import("../libs/search");
}

afterEach(() => {
  resetMocks();
});

describe("getSearchData", () => {
  test("returns the Zen mode keyboard shortcuts when Zen mode is enabled", async () => {
    const { getSearchData } = await importSearch(true);

    expect((await getSearchData("/zen-mode/demo/")).shortcuts).toEqual([
      { keys: ["z"], ctrl: true, shift: true, alt: false, mode: "zen-mode" },
    ]);
  });

  test("returns no keyboard shortcuts when Zen mode is disabled", async () => {
    const { getSearchData } = await importSearch(false);

    expect((await getSearchData("/demo/")).shortcuts).toEqual([]);
  });
});
