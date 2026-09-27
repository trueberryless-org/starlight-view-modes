import type { StarlightRouteData } from "@astrojs/starlight/route-data";
import { describe, expect, test } from "vitest";

import {
  getPresentationSequence,
  getSequencePage,
  getSequencePages,
  setSequencePages,
} from "../libs/sequence";

type SidebarEntry = StarlightRouteData["sidebar"][number];

function link(label: string, isCurrent = false) {
  return { type: "link", label, href: `/${label}/`, isCurrent, badge: undefined, attrs: {} } satisfies SidebarEntry;
}

function group(label: string, entries: SidebarEntry[]): SidebarEntry {
  return { type: "group", label, entries, collapsed: false, badge: undefined };
}

function route(sidebar: SidebarEntry[], prev?: string, next?: string, locale?: string) {
  return {
    locale,
    pagination: { prev: prev ? link(prev) : undefined, next: next ? link(next) : undefined },
    sidebar,
  };
}

describe("getPresentationSequence", () => {
  const sidebar = [
    link("home"),
    group("intro", [link("a"), link("b")]),
    group("course", [link("c"), group("chapter", [link("d", true), link("e")])]),
    link("end"),
  ];

  test("returns the top-level sidebar group of the current page and its position", () => {
    expect(getPresentationSequence(route(sidebar, "c", "e", "fr"))).toEqual({
      href: "/d/",
      id: "fr/2",
      index: 1,
      next: "/e/",
      previous: "/c/",
    });
  });

  test("excludes previous and next pages outside of the sidebar group", () => {
    expect(getPresentationSequence(route(sidebar, "b", "end"))).toMatchObject({
      id: "/2",
      next: undefined,
      previous: undefined,
    });
  });

  test("returns nothing for pages outside of a sidebar group", () => {
    expect(getPresentationSequence(route([link("home", true), group("intro", [link("a")])]))).toBeUndefined();
  });
});

describe("getSequencePages", () => {
  test("returns the pages of each sequence in order with their slide counts", () => {
    const pages = [
      { href: "/c/", id: "/0", index: 2, slides: 4 },
      { href: "/a/", id: "/0", index: 0, slides: 6 },
      { href: "/x/", id: "/1", index: 0, slides: 3 },
      { href: "/b/", id: "/0", index: 1, slides: 5 },
    ];
    const sequences = getSequencePages(pages);
    const course = [
      { href: "/a/", slides: 6 },
      { href: "/b/", slides: 5 },
      { href: "/c/", slides: 4 },
    ];

    expect(pages.map((page) => sequences.get(page))).toEqual([course, course, [{ href: "/x/", slides: 3 }], course]);
  });
});

describe("sequence pages", () => {
  const html =
    '<p>Before</p><div class="starlight-view-modes-presentation-sequence" hidden data-href="/b/" data-jump-label="Jump" data-next="/c/" data-sequence="en/1" data-sequence-index="3" data-slides="12"></div>';

  test("reads the sequence of a built page", () => {
    expect(getSequencePage(html)).toEqual({ href: "/b/", id: "en/1", index: 3, slides: 12 });
    expect(
      getSequencePage('<div class="starlight-view-modes-presentation-sequence" hidden data-slides="12"></div>')
    ).toBeUndefined();
    expect(getSequencePage("<p>No presentation</p>")).toBeUndefined();
  });

  test("adds the pages of the sequence to a built page", () => {
    expect(setSequencePages(html, [{ href: "/b/", slides: 12 }])).toBe(
      html.replace("></div>", ' data-pages="[{&quot;href&quot;:&quot;/b/&quot;,&quot;slides&quot;:12}]"></div>')
    );
  });
});
