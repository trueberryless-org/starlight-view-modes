import Reveal, { type RevealApi, type TransitionStyle } from "reveal.js";
import Notes, { type NotesPlugin } from "reveal.js/plugin/notes";
import Zoom from "reveal.js/plugin/zoom";

import { updateModeLinksWithHash } from "./navigation";

const SlideWidth = 1280;
const SlideHeight = 720;
const IdleDelay = 2500;
const MinimumFitScale = 0.5;
const FitAttempts = 3;
const PrintQueryParameter = "print-pdf";
const ContentsKey = { keyCode: 77, key: "M" };

export async function initializePresentation(
  element: HTMLElement
): Promise<void> {
  const revealElement = element.querySelector<HTMLElement>(".reveal");
  const contents = element.querySelector<HTMLDialogElement>("dialog");
  if (!revealElement || !contents) return;

  const deck = new Reveal(revealElement, {
    center: false,
    // Vertical slides structure the overview while the arrow keys still go through all slides in order.
    navigationMode: "linear",
    keyboardCondition: () => !contents.open,
    hash: false,
    history: false,
    respondToHashChanges: false,
    width: SlideWidth,
    height: SlideHeight,
    margin: 0.04,
    plugins: [Notes, Zoom],
    ...getDeckConfig(parseDeckOptions(element.dataset["options"])),
  });

  await deck.initialize();
  await document.fonts.ready;

  if (isPrintView()) {
    deck.on("pdf-ready", () => {
      fitSlides(deck.getSlides());
      window.print();
    });
    return;
  }

  fitVisibleSlides(deck);
  showHashSlide(deck);
  deck.on("slidechanged", () => {
    fitVisibleSlides(deck);
    updateHash(deck);
  });
  window.addEventListener("hashchange", () => showHashSlide(deck));

  setupToolbar(element, deck, contents);
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

async function toggleFullscreen(): Promise<void> {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await document.documentElement.requestFullscreen();
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

export interface DeckOptions {
  slideNumber: boolean;
  transition: TransitionStyle;
}
