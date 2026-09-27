import type { RevealApi, RevealPlugin } from "reveal.js";

import { SequenceClassName, type SequencePageSlides } from "./sequence";

const SlideQueryParameter = "slide";
const LastSlideQueryValue = "last";

export function getSequence(element: HTMLElement): Sequence | undefined {
  const sequence = element.querySelector<HTMLElement>(`.${SequenceClassName}`);
  if (!sequence) return undefined;

  const { href, next, pages, previous } = sequence.dataset;
  const sequencePages = parseSequencePages(pages);
  const index = sequencePages.findIndex((page) => page.href === href);

  return {
    href: href ?? "",
    next,
    offset: sequencePages
      .slice(0, Math.max(index, 0))
      .reduce((sum, page) => sum + page.slides, 0),
    // Pages of a sequence are only known in production builds.
    pages: index === -1 ? undefined : sequencePages,
    previous,
  };
}

// Slide numbers count the slides of all pages of the sequence.
export function getSequenceConfig(
  { offset, pages }: Sequence,
  getDeck: () => RevealApi
): { slideNumber?: (slide: HTMLElement) => [string, string, string] } {
  if (!pages) return {};

  const total = pages.reduce((sum, page) => sum + page.slides, 0);

  return {
    slideNumber: (slide) => [
      String(offset + getDeck().getSlidePastCount(slide) + 1),
      "/",
      // reveal.js only renders the total when it is a number, contrary to its types.
      total as unknown as string,
    ],
  };
}

// Continues the presentation on the next or previous page of the sequence when going past the last or first slide.
// All navigations of reveal.js, e.g. using the keyboard, the controls, or touch gestures, go through the instance given
// to plugins, which differs from the one returned by the constructor, so wrapping its methods covers all of them and
// enables the controls towards the next or previous page.
export function getSequenceNavigationPlugin(sequence: Sequence): RevealPlugin {
  return {
    id: "starlight-view-modes-sequence-navigation",
    init: (deck) => setupSequenceNavigation(deck, sequence),
  };
}

function setupSequenceNavigation(
  deck: RevealApi,
  { next, previous }: Sequence
): void {
  if (!next && !previous) return;

  const { availableRoutes, isFirstSlide, isLastSlide } = deck;
  const isRtl = () => deck.getConfig().rtl === true;
  const getForward = () => (isRtl() ? "left" : "right");
  const getBackward = () => (isRtl() ? "right" : "left");

  const navigate = (
    direction: "next" | "previous",
    isAtEdge: () => boolean
  ) => {
    const href =
      direction === "next"
        ? next
        : previous && getSlideHref(previous, LastSlideQueryValue);
    if (!href || !isAtEdge()) return false;

    window.location.href = href;
    return true;
  };
  const wrap =
    <T extends unknown[]>(
      method: (...args: T) => void,
      direction: () => "next" | "previous",
      isAtEdge: () => boolean
    ) =>
    (...args: T) => {
      if (!navigate(direction(), isAtEdge)) method(...args);
    };

  const isAtForwardEdge = () => !availableRoutes()[getForward()];
  const isAtBackwardEdge = () => !availableRoutes()[getBackward()];

  deck.availableRoutes = (options) => {
    const routes = availableRoutes(options);

    return {
      ...routes,
      [getForward()]: routes[getForward()] || next !== undefined,
      [getBackward()]: routes[getBackward()] || previous !== undefined,
    };
  };

  const right = wrap(
    deck.right,
    () => (isRtl() ? "previous" : "next"),
    () => (isRtl() ? isAtBackwardEdge() : isAtForwardEdge())
  );
  const left = wrap(
    deck.left,
    () => (isRtl() ? "next" : "previous"),
    () => (isRtl() ? isAtForwardEdge() : isAtBackwardEdge())
  );
  const nextSlide = wrap(deck.next, () => "next", isLastSlide);
  const previousSlide = wrap(deck.prev, () => "previous", isFirstSlide);

  Object.assign(deck, {
    left,
    navigateLeft: left,
    navigateNext: nextSlide,
    navigatePrev: previousSlide,
    navigateRight: right,
    next: nextSlide,
    prev: previousSlide,
    right,
  });
}

// Shows the slide requested when navigating from another page of the sequence, e.g. the last slide when going back.
export function showQuerySlide(deck: RevealApi): boolean {
  const url = new URL(window.location.href);
  const value = url.searchParams.get(SlideQueryParameter);
  if (!value) return false;

  url.searchParams.delete(SlideQueryParameter);
  history.replaceState(history.state, "", url);

  const slides = deck.getSlides();
  const slide =
    value === LastSlideQueryValue ? slides.at(-1) : slides[Number(value) - 1];
  if (!slide) return false;

  const { h, v } = deck.getIndices(slide);
  deck.slide(h, v);

  return true;
}

export function getSlideHref(href: string, slide: string): string {
  const url = new URL(href, window.location.href);
  url.searchParams.set(SlideQueryParameter, slide);

  return url.href;
}

function parseSequencePages(pages: string | undefined): SequencePageSlides[] {
  try {
    return JSON.parse(pages || "[]");
  } catch {
    return [];
  }
}

export interface Sequence {
  href: string;
  next: string | undefined;
  offset: number;
  pages: SequencePageSlides[] | undefined;
  previous: string | undefined;
}
