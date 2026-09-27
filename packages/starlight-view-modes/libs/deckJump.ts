import type { RevealApi } from "reveal.js";

import { type Sequence, getSlideHref } from "./deckSequence";
import type { SequencePageSlides } from "./sequence";

const JumpKey = { keyCode: 71, key: "G" };
const JumpDelay = 1000;

// Replaces the built-in reveal.js jump to slide feature to display it below the breadcrumbs, and to jump to slides of
// all pages of a sequence using their slide numbers.
export function setupJump(
  container: HTMLElement,
  deck: RevealApi,
  sequence: Sequence | undefined
): void {
  const label = container.dataset["jumpLabel"] ?? JumpKey.key;
  const href = sequence?.pages ? sequence.href : undefined;
  const input = document.createElement("input");
  let indicesOnShow = deck.getIndices();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  input.className = "starlight-view-modes-presentation-jump";
  input.type = "text";
  input.placeholder = label;
  input.setAttribute("aria-label", label);

  const getPages = (): SequencePageSlides[] =>
    sequence?.pages ?? [{ href: "", slides: deck.getTotalSlides() }];
  const hide = () => {
    clearTimeout(timeout);
    input.remove();
    input.value = "";
  };
  const restore = () => deck.slide(indicesOnShow.h, indicesOnShow.v);
  const jump = (isConfirmed: boolean) => {
    clearTimeout(timeout);

    const target = getJumpTarget(
      deck,
      input.value.trim(),
      href ?? "",
      getPages()
    );

    if (target?.type === "page") {
      if (isConfirmed) window.location.href = target.href;
    } else if (target) {
      deck.slide(target.h, target.v);
    } else {
      restore();
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
      restore();
      hide();
    }
    event.stopPropagation();
  });
  input.addEventListener("blur", hide);

  deck.addKeyBinding({ ...JumpKey, description: label }, () => {
    if (input.isConnected) return hide();

    indicesOnShow = deck.getIndices();
    container.append(input);
    input.focus();
  });
}

function getJumpTarget(
  deck: RevealApi,
  value: string,
  href: string,
  pages: SequencePageSlides[]
): JumpTarget | undefined {
  if (/^\d+$/.test(value)) {
    let number = Number(value);

    for (const page of pages) {
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

type JumpTarget =
  | { type: "page"; href: string }
  | { type: "slide"; h: number; v: number | undefined };
