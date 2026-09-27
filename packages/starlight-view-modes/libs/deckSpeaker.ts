import type { RevealApi } from "reveal.js";

// The reveal.js speaker view displays the current and upcoming slides in previews of the presentation, loaded with a
// `receiver` query parameter. Only the current slide preview is interactive and sends events to the speaker view.
const ReceiverPattern = /[?&]receiver\b/i;
const InteractivePreviewPattern = /[?&]postMessageEvents=true\b/i;
const PreviewSelectors = ["#current-slide iframe", "#upcoming-slide iframe"];

export function isSpeakerPreview(): boolean {
  return ReceiverPattern.test(window.location.search);
}

// Returns how to open another page of the presentation, e.g. the next page of a sequence, or nothing if the current
// window cannot do so. The current slide preview of the speaker view opens pages in the presentation window instead of
// itself, and the upcoming slide preview never opens other pages.
export function getPageNavigator(): ((href: string) => void) | undefined {
  if (!isSpeakerPreview()) {
    return (href) => {
      window.location.href = href;
    };
  }

  if (!InteractivePreviewPattern.test(window.location.search)) return undefined;

  const presentation = getPresentationWindow();
  if (!presentation) return undefined;

  return (href) => {
    presentation.location.href = new URL(href, window.location.href).href;
  };
}

// The speaker view only sets up its previews for the page it was opened from. When the presentation continues on
// another page, e.g. the next page of a sequence, the speaker view reconnects to it, and its previews are updated to
// display the new page. Until then, slides requested by the speaker view come from previews of another page and are
// ignored, so this must be set up before initializing reveal.js to run before its message handler.
export function syncSpeakerView(): (deck: RevealApi) => void {
  let isReloading = false;

  window.addEventListener(
    "message",
    (event) => {
      const speakerView = getSpeakerView(event.source);
      if (!speakerView || !isSetStateMessage(event.data)) return;

      if (isReloading || getOutdatedPreviews(speakerView).length > 0) {
        event.stopImmediatePropagation();
      }
    },
    { capture: true }
  );

  return (deck) => {
    window.addEventListener("message", (event) => {
      const speakerView = getSpeakerView(event.source);
      if (!speakerView || isReloading || !isNotesHeartbeat(event.data)) return;

      const previews = getOutdatedPreviews(speakerView);
      if (previews.length === 0) return;

      isReloading = true;
      let loadedPreviews = 0;

      for (const preview of previews) {
        preview.addEventListener(
          "load",
          () => {
            loadedPreviews++;
            if (loadedPreviews < previews.length) return;

            isReloading = false;
            // The notes plugin sends the current state to the speaker view on some events, e.g. when resuming.
            deck.getRevealElement()?.dispatchEvent(new CustomEvent("resumed"));
          },
          { once: true }
        );

        // Previews read their initial slide from their hash, which would otherwise be the slide of the previous page.
        const { h, v } = deck.getIndices();
        const url = new URL(preview.src);
        url.pathname = window.location.pathname;
        url.hash = `/${h}/${v ?? 0}`;
        preview.src = url.href;
      }
    });
  };
}

function getOutdatedPreviews(speakerView: Window): HTMLIFrameElement[] {
  return PreviewSelectors.flatMap(
    (selector) =>
      speakerView.document.querySelector<HTMLIFrameElement>(selector) ?? []
  ).filter(
    (preview) => getPreviewPathname(preview) !== window.location.pathname
  );
}

function getPresentationWindow(): Window | undefined {
  try {
    const presentation = window.parent.opener as Window | null;

    return presentation?.location.origin === window.location.origin
      ? presentation
      : undefined;
  } catch {
    return undefined;
  }
}

// Returns the speaker view window sending a message, if any.
function getSpeakerView(source: MessageEventSource | null): Window | undefined {
  try {
    if (!source || !("document" in source)) return undefined;
    if (source.location.origin !== window.location.origin) return undefined;

    return source.document.querySelector("#current-slide") ? source : undefined;
  } catch {
    return undefined;
  }
}

function getPreviewPathname(preview: HTMLIFrameElement): string | undefined {
  try {
    return new URL(preview.src).pathname;
  } catch {
    return undefined;
  }
}

function isNotesHeartbeat(data: unknown): boolean {
  const message = parseMessage(data);

  return (
    message?.["namespace"] === "reveal-notes" && message["type"] === "heartbeat"
  );
}

function isSetStateMessage(data: unknown): boolean {
  return parseMessage(data)?.["method"] === "setState";
}

function parseMessage(data: unknown): Record<string, unknown> | undefined {
  if (typeof data !== "string") return undefined;

  try {
    const message: unknown = JSON.parse(data);

    return typeof message === "object" && message !== null
      ? (message as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}
