import type { RevealApi, RevealPlugin } from "reveal.js";

import { SequenceClassName, type SequencePageSlides } from "./sequence";

const SlideQueryParameter = "slide";
const LastSlideQueryValue = "last";
const JumpKey = { keyCode: 71, key: "G" };
const JumpDelay = 1000;

export function getSequence(element: HTMLElement): Sequence | undefined {
  const sequence = element.querySelector<HTMLElement>(`.${SequenceClassName}`);
  if (!sequence) return undefined;

  const { href, jumpLabel, next, pages, previous } = sequence.dataset;
  const sequencePages = parseSequencePages(pages);
  const index = sequencePages.findIndex((page) => page.href === href);

  return {
    href: href ?? "",
    jumpLabel: jumpLabel ?? JumpKey.key,
    next,
    offset: sequencePages
      .slice(0, Math.max(index, 0))
      .reduce((sum, page) => sum + page.slides, 0),
    // Pages of a sequence are only known in production builds.
    pages: index === -1 ? undefined : sequencePages,
    previous,
  };
}

// Slide numbers count the slides of all pages of the sequence, and the built-in reveal.js jump to slide feature, only
// aware of the current page, is replaced by one using these numbers.
export function getSequenceConfig(
  { offset, pages }: Sequence,
  getDeck: () => RevealApi
): {
  jumpToSlide?: boolean;
  slideNumber?: (slide: HTMLElement) => [string, string, string];
} {
  if (!pages) return {};

  const total = pages.reduce((sum, page) => sum + page.slides, 0);

  return {
    jumpToSlide: false,
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

  const { availableRoutes, isFirstSlide, isLastSlide, isOverview } = deck;
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
    if (!href || isOverview() || !isAtEdge()) return false;

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
    if (isOverview()) return routes;

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

export function setupSequenceJump(deck: RevealApi, sequence: Sequence): void {
  const { jumpLabel, pages } = sequence;
  if (!pages) return;

  const element = document.createElement("div");
  const input = document.createElement("input");
  let indicesOnShow = deck.getIndices();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  // The markup of the built-in reveal.js jump to slide feature is reused to share its styles.
  element.className = "jump-to-slide";
  input.className = "jump-to-slide-input";
  input.type = "text";
  input.placeholder = jumpLabel;
  input.setAttribute("aria-label", jumpLabel);
  element.append(input);

  const hide = () => {
    clearTimeout(timeout);
    element.remove();
    input.value = "";
  };
  const jump = (isConfirmed: boolean) => {
    clearTimeout(timeout);

    const target = getJumpTarget(deck, input.value.trim(), sequence);

    if (target?.type === "page") {
      if (isConfirmed) window.location.href = target.href;
    } else if (target) {
      deck.slide(target.h, target.v);
    } else {
      deck.slide(indicesOnShow.h, indicesOnShow.v);
    }
  };

  input.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => jump(false), JumpDelay);
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      jump(true);
      hide();
    } else if (event.key === "Escape") {
      event.preventDefault();
      deck.slide(indicesOnShow.h, indicesOnShow.v);
      hide();
    }
    event.stopPropagation();
  });
  input.addEventListener("blur", hide);

  deck.addKeyBinding({ ...JumpKey, description: jumpLabel }, () => {
    if (element.isConnected) return hide();

    indicesOnShow = deck.getIndices();
    deck.getRevealElement()?.append(element);
    input.focus();
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

function getJumpTarget(
  deck: RevealApi,
  value: string,
  { href, pages }: Sequence
): JumpTarget | undefined {
  if (/^\d+$/.test(value)) {
    let number = Number(value);

    for (const page of pages ?? []) {
      if (number >= 1 && number <= page.slides) {
        return page.href === href
          ? getSlideTarget(deck, deck.getSlides()[number - 1])
          : { type: "page", href: getSlideHref(page.href, String(number)) };
      }

      number -= page.slides;
    }

    return undefined;
  }

  if (value.length < 2) return undefined;

  // Like the built-in reveal.js feature, other values search the slides of the current page.
  const pattern = new RegExp(
    `\\b${value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
    "i"
  );

  return getSlideTarget(
    deck,
    deck.getSlides().find((slide) => pattern.test(slide.innerText))
  );
}

function getSlideTarget(
  deck: RevealApi,
  slide: HTMLElement | undefined
): JumpTarget | undefined {
  if (!slide) return undefined;

  const { h, v } = deck.getIndices(slide);

  return { type: "slide", h, v };
}

function getSlideHref(href: string, slide: string): string {
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

type JumpTarget =
  | { type: "page"; href: string }
  | { type: "slide"; h: number; v: number | undefined };

export interface Sequence {
  href: string;
  jumpLabel: string;
  next: string | undefined;
  offset: number;
  pages: SequencePageSlides[] | undefined;
  previous: string | undefined;
}
