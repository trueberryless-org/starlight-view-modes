import type { StarlightRouteData } from "@astrojs/starlight/route-data";
import { describe, expect, test } from "vitest";

import {
  getPresentationSequence,
  getSequenceCounts,
  getSequencePage,
  setSequenceCount,
} from "../libs/sequence";

type SidebarEntry = StarlightRouteData["sidebar"][number];

function link(label: string, isCurrent = false): SidebarEntry {
  return { type: "link", label, href: `/${label}/`, isCurrent, badge: undefined, attrs: {} };
}

function group(label: string, entries: SidebarEntry[]): SidebarEntry {
  return { type: "group", label, entries, collapsed: false, badge: undefined };
}

describe("getPresentationSequence", () => {
  test("returns the top-level sidebar group of the current page and its position", () => {
    const sidebar = [
      link("home"),
      group("intro", [link("a"), link("b")]),
      group("course", [link("c"), group("chapter", [link("d"), link("e", true)])]),
    ];

    expect(getPresentationSequence(sidebar, "fr")).toEqual({ id: "fr/2", index: 2 });
    expect(getPresentationSequence(sidebar, undefined)).toEqual({ id: "/2", index: 2 });
  });

  test("returns nothing for pages outside of a sidebar group", () => {
    expect(getPresentationSequence([link("home", true), group("intro", [link("a")])], undefined)).toBeUndefined();
  });
});

describe("getSequenceCounts", () => {
  test("counts the slides of the pages of each sequence in order", () => {
    const pages = [
      { id: "/0", index: 2, slides: 4 },
      { id: "/0", index: 0, slides: 6 },
      { id: "/1", index: 0, slides: 3 },
      { id: "/0", index: 1, slides: 5 },
    ];
    const counts = getSequenceCounts(pages);

    expect(pages.map((page) => counts.get(page))).toEqual([
      { offset: 11, total: 15 },
      { offset: 0, total: 15 },
      { offset: 0, total: 3 },
      { offset: 6, total: 15 },
    ]);
  });
});

describe("sequence pages", () => {
  const html =
    '<p>Before</p><div class="starlight-view-modes-presentation-sequence" hidden data-next="/b/" data-sequence="en/1" data-sequence-index="3" data-slides="12"></div>';

  test("reads the sequence of a built page", () => {
    expect(getSequencePage(html)).toEqual({ id: "en/1", index: 3, slides: 12 });
    expect(
      getSequencePage('<div class="starlight-view-modes-presentation-sequence" hidden data-slides="12"></div>')
    ).toBeUndefined();
    expect(getSequencePage("<p>No presentation</p>")).toBeUndefined();
  });

  test("adds the slide counts of the sequence to a built page", () => {
    expect(setSequenceCount(html, { offset: 20, total: 50 })).toBe(
      '<p>Before</p><div class="starlight-view-modes-presentation-sequence" hidden data-next="/b/" data-sequence="en/1" data-sequence-index="3" data-slides="12" data-offset="20" data-total="50"></div>'
    );
  });
});
