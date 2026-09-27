import Reveal, { type RevealApi, type TransitionStyle } from "reveal.js";
import Notes, { type NotesPlugin } from "reveal.js/plugin/notes";
import Zoom from "reveal.js/plugin/zoom";

import { updateModeLinksWithHash } from "./navigation";
import { SequenceClassName } from "./sequence";

const SlideWidth = 1280;
const SlideHeight = 720;
const IdleDelay = 2500;
const MinimumFitScale = 0.5;
const FitAttempts = 3;
const PrintQueryParameter = "print-pdf";
const SlideQueryParameter = "slide";
const LastSlideQueryValue = "last";
const ContentsKey = { keyCode: 77, key: "M" };

export async function initializePresentation(
  element: HTMLElement
): Promise<void> {
  const revealElement = element.querySelector<HTMLElement>(".reveal");
  const contents = element.querySelector<HTMLDialogElement>("dialog");
  if (!revealElement || !contents) return;

  const sequence = getSequence(element);

  const deck: RevealApi = new Reveal(revealElement, {
    center: false,
    // Keyboard navigation is disabled while a dialog is open, e.g. the contents or the search.
    keyboardCondition: () => !document.querySelector("dialog[open]"),
    hash: false,
    history: false,
    respondToHashChanges: false,
    width: SlideWidth,
    height: SlideHeight,
    margin: 0.04,
    plugins: [Notes, Zoom],
    ...getDeckConfig(parseDeckOptions(element.dataset["options"])),
    ...getSequenceConfig(sequence, () => deck),
  });

  const isPrinting = isPrintView();

  // The print view is laid out during the initialization, so the handler must be registered before.
  if (isPrinting) {
    deck.on("pdf-ready", async () => {
      await document.fonts.ready;
      fitSlides(deck.getSlides());
      window.print();
    });
  }

  await deck.initialize();
  await document.fonts.ready;

  if (isPrinting) return;

  fitVisibleSlides(deck);
  if (showLastSlide(deck, sequence)) {
    updateHash(deck);
  } else {
    showHashSlide(deck);
  }
  updateBreadcrumbs(element, deck);
  deck.on("slidechanged", () => {
    fitVisibleSlides(deck);
    updateHash(deck);
    updateBreadcrumbs(element, deck);
  });
  window.addEventListener("hashchange", () => showHashSlide(deck));

  setupToolbar(element, deck, contents);
  setupPageNavigation(deck, sequence);
  watchIdle(element);

  element.setAttribute("data-ready", "");
}

function getDeckConfig(options: DeckOptions) {
  return {
    rtl: document.documentElement.dir === "rtl",
    slideNumber: options.slideNumber ? ("c/t" as const) : false,
    transition: options.transition,
  };
}

// Slide numbers count the slides of all pages presented in sequence, e.g. the lessons of a course, when known.
function getSequenceConfig(
  { offset, total }: Sequence,
  getDeck: () => RevealApi
): { slideNumber?: (slide: HTMLElement) => [string, string, string] } {
  if (offset === undefined || total === undefined) return {};

  return {
    slideNumber: (slide) => [
      String(offset + getDeck().getSlidePastCount(slide) + 1),
      "/",
      // reveal.js only renders the total when it is a number, contrary to its types.
      total as unknown as string,
    ],
  };
}

function getSequence(element: HTMLElement): Sequence {
  const { next, offset, previous, total } =
    element.querySelector<HTMLElement>(`.${SequenceClassName}`)?.dataset ?? {};

  return {
    next,
    offset: offset ? Number(offset) : undefined,
    previous,
    total: total ? Number(total) : undefined,
  };
}

function parseDeckOptions(options: string | undefined): DeckOptions {
  return {
    slideNumber: true,
    transition: "slide",
    ...JSON.parse(options || "{}"),
  };
}

function isPrintView(): boolean {
  return new URLSearchParams(window.location.search).has(PrintQueryParameter);
}

// Slides are only measurable when displayed, which reveal.js only does for slides close to the current one.
function fitVisibleSlides(deck: RevealApi): void {
  fitSlides(deck.getSlides().filter((slide) => slide.offsetHeight > 0));
}

// Shrinks the content of slides overflowing the available space, e.g. a single long code block.
function fitSlides(slides: HTMLElement[]): void {
  for (const slide of slides) {
    const content = slide.querySelector<HTMLElement>(
      ".starlight-view-modes-presentation-slide"
    );
    if (!content || content.dataset["fitted"] !== undefined) continue;

    const { paddingBlockEnd, paddingBlockStart } = getComputedStyle(content);
    const padding = parseFloat(paddingBlockStart) + parseFloat(paddingBlockEnd);
    let scale = 1;

    for (let attempt = 0; attempt < FitAttempts; attempt++) {
      const available = content.clientHeight - padding;
      const used = content.scrollHeight - padding;
      if (used <= available || scale <= MinimumFitScale) break;

      scale = Math.max(MinimumFitScale, (scale * available) / used);
      content.style.setProperty("--fit", String(scale));
    }

    content.dataset["fitted"] = "";
  }
}

function showHashSlide(deck: RevealApi): void {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;

  const slide =
    deck.getSlides().find((slide) => slide.dataset["anchor"] === id) ??
    deck
      .getSlidesElement()
      ?.querySelector(`#${CSS.escape(id)}`)
      ?.closest<HTMLElement>("section");
  if (!slide) return;

  const { h, v } = deck.getIndices(slide);
  deck.slide(h, v);
}

// Shows the last slide before the next page, e.g. when going back from the next page.
function showLastSlide(deck: RevealApi, { next }: Sequence): boolean {
  const url = new URL(window.location.href);
  if (url.searchParams.get(SlideQueryParameter) !== LastSlideQueryValue) {
    return false;
  }

  url.searchParams.delete(SlideQueryParameter);
  history.replaceState(history.state, "", url);

  const slide = deck.getSlides().at(next ? -2 : -1);
  if (!slide) return false;

  const { h, v } = deck.getIndices(slide);
  deck.slide(h, v);

  return true;
}

// Continues the presentation on the next or previous page when going past the last or first slide.
function setupPageNavigation(
  deck: RevealApi,
  { next, previous }: Sequence
): void {
  document.addEventListener(
    "keydown",
    (event) => {
      const direction = getNavigationDirection(event);
      if (!direction || !deck.isReady() || deck.isOverview() || deck.isPaused())
        return;
      if (document.querySelector("dialog[open]")) return;

      const href =
        direction === "next"
          ? deck.isLastSlide() && next
          : deck.isFirstSlide() && previous && getLastSlideHref(previous);
      if (!href) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.href = href;
    },
    { capture: true }
  );
}

function getNavigationDirection(
  event: KeyboardEvent
): "next" | "previous" | undefined {
  if (event.altKey || event.ctrlKey || event.metaKey) return undefined;
  if (event.target instanceof HTMLElement && isEditable(event.target)) {
    return undefined;
  }

  const isRtl = document.documentElement.dir === "rtl";

  switch (event.key) {
    case "ArrowRight":
    case "l":
      return isRtl ? "previous" : "next";
    case "ArrowLeft":
    case "h":
      return isRtl ? "next" : "previous";
    case "PageDown":
    case "n":
      return "next";
    case "PageUp":
    case "p":
      return "previous";
    case " ":
      return event.shiftKey ? "previous" : "next";
    default:
      return undefined;
  }
}

function isEditable(element: HTMLElement): boolean {
  return (
    element.isContentEditable ||
    ["INPUT", "SELECT", "TEXTAREA"].includes(element.tagName)
  );
}

function getLastSlideHref(href: string): string {
  const url = new URL(href, window.location.href);
  url.searchParams.set(SlideQueryParameter, LastSlideQueryValue);

  return url.href;
}

function updateBreadcrumbs(element: HTMLElement, deck: RevealApi): void {
  const list = element.querySelector(
    ".starlight-view-modes-presentation-breadcrumbs ol"
  );
  if (!list) return;

  const breadcrumbs: string[] = JSON.parse(
    deck.getCurrentSlide().dataset["breadcrumbs"] ?? "[]"
  );

  list.replaceChildren(
    ...breadcrumbs.map((breadcrumb) => {
      const item = document.createElement("li");
      item.textContent = breadcrumb;
      return item;
    })
  );
}

function updateHash(deck: RevealApi): void {
  const url = new URL(window.location.href);
  url.hash = deck.getCurrentSlide().dataset["anchor"] ?? "";

  history.replaceState(history.state, "", url);
  updateModeLinksWithHash();
}

function setupToolbar(
  element: HTMLElement,
  deck: RevealApi,
  contents: HTMLDialogElement
): void {
  const contentsLabel =
    element.querySelector<HTMLElement>('[data-action="contents"]')?.title ??
    ContentsKey.key;

  deck.addKeyBinding({ ...ContentsKey, description: contentsLabel }, () =>
    openContents(deck, contents)
  );

  // Close the contents when clicking its backdrop.
  contents.addEventListener("click", (event) => {
    if (event.target === contents) contents.close();
  });

  element.addEventListener("click", (event) => {
    const action =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-action]")?.dataset["action"]
        : undefined;

    switch (action) {
      case "contents":
        openContents(deck, contents);
        break;
      case "close-contents":
        contents.close();
        break;
      case "overview":
        deck.toggleOverview();
        break;
      case "speaker-view":
        (deck.getPlugin("notes") as NotesPlugin | undefined)?.open();
        break;
      case "fullscreen":
        void toggleFullscreen();
        break;
      case "print":
        openPrintView();
        break;
      case "search":
        openSearch(event);
        break;
    }
  });
}

// Highlights the section of the current slide in the page outline.
function openContents(deck: RevealApi, contents: HTMLDialogElement): void {
  const slide = deck.getSlidePastCount() + 1;
  const headings = [
    ...contents.querySelectorAll<HTMLElement>("li[data-slide]"),
  ];
  const current = headings.findLast(
    (heading) => Number(heading.dataset["slide"]) <= slide
  );

  for (const heading of headings) {
    heading.querySelector("a")?.removeAttribute("aria-current");
  }
  current?.querySelector("a")?.setAttribute("aria-current", "location");

  contents.showModal();
  current?.scrollIntoView({ block: "nearest" });
}

// Opens the Starlight search dialog rendered in the hidden page header.
function openSearch(event: MouseEvent): void {
  // The search dialog closes on clicks outside of it, which would include this click once reaching the window.
  event.stopPropagation();
  document
    .querySelector<HTMLButtonElement>("site-search button[data-open-modal]")
    ?.click();
}

async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // Fullscreen can be denied by the browser, e.g. by a permissions policy, which leaves the presentation unchanged.
  }
}

function openPrintView(): void {
  const url = new URL(window.location.href);
  url.searchParams.set(PrintQueryParameter, "");
  url.hash = "";

  window.open(url, "_blank", "noopener");
}

// Hides the toolbar and the cursor when the pointer has not moved for a while.
function watchIdle(element: HTMLElement): void {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const wake = () => {
    element.removeAttribute("data-idle");
    clearTimeout(timeout);
    timeout = setTimeout(
      () => element.setAttribute("data-idle", ""),
      IdleDelay
    );
  };

  wake();
  element.addEventListener("pointermove", wake);
  element.addEventListener("focusin", wake);
}

interface Sequence {
  next: string | undefined;
  offset: number | undefined;
  previous: string | undefined;
  total: number | undefined;
}

export interface DeckOptions {
  slideNumber: boolean;
  transition: TransitionStyle;
}
