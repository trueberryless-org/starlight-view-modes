import type { RevealApi } from "reveal.js";
import { describe, expect, test } from "vitest";

import { type Sequence, getSequenceConfig } from "../libs/deckSequence";

const sequence: Sequence = {
  href: "/b/",
  next: undefined,
  offset: 6,
  pages: [
    { href: "/a/", slides: 6 },
    { href: "/b/", slides: 4 },
  ],
  previous: "/a/",
};

// The current slide is the third slide of its page.
function getDeck() {
  return { getSlidePastCount: () => 2 } as unknown as RevealApi;
}

describe("getSequenceConfig", () => {
  test("numbers the slides of all pages of the sequence", () => {
    const { slideNumber } = getSequenceConfig(sequence, { slideNumber: true }, getDeck);

    expect(slideNumber?.({} as HTMLElement)).toEqual(["9", "/", 10]);
  });

  test("does not display slide numbers when disabled", () => {
    expect(getSequenceConfig(sequence, { slideNumber: false }, getDeck)).toEqual({});
  });

  test("does not change slide numbers when the pages of the sequence are unknown", () => {
    expect(getSequenceConfig({ ...sequence, pages: undefined }, { slideNumber: true }, getDeck)).toEqual({});
  });
});
