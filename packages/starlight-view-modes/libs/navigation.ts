import { stripTrailingSlash } from "./path";
import { type Shortcut, isShortcutPressed } from "./shortcuts";
import {
  getCurrentModeFromPath,
  getUpdatedModePathname,
  insertModePathname,
  stripModePathname,
} from "./utils";

const DefaultMode = "default";
// Distance below the scroll padding, where headings are placed when navigating to them, to consider a section read.
const SectionReadingOffset = 32;
const SwitcherLinkSelector = ".starlight-view-modes-switcher-a";

export function parseShortcuts(shortcuts: string | undefined): Shortcut[] {
  try {
    return JSON.parse(shortcuts || "[]");
  } catch {
    return [];
  }
}

export function updateModeLinksWithHash(): void {
  const links =
    document.querySelectorAll<HTMLAnchorElement>(SwitcherLinkSelector);

  for (const link of links) {
    link.href = getHrefWithHash(link.href, window.location.hash);
  }
}

// Pages without a page in an additional mode, e.g. excluded pages linked from the content or the search results, are
// opened in the default mode instead.
export function redirectToDefaultMode(): void {
  const pathname = stripModePathname(window.location.pathname);
  if (pathname === undefined) return;

  const url = new URL(window.location.href);
  url.pathname = pathname;

  window.location.replace(url);
}

// Links to another view mode of the current page, including custom switchers built using the view modes data, open the
// section currently being read.
export function preserveSectionOnModeSwitch(): void {
  const updateLink = (event: Event) => {
    const link =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>("a[href]")
        : null;

    if (link && isOtherModeLink(link)) {
      link.href = getHrefWithHash(link.href, getCurrentSectionHash());
    }
  };

  document.addEventListener("click", updateLink, { capture: true });
  document.addEventListener("auxclick", updateLink, { capture: true });
}

export async function switchModeWithShortcut(
  event: KeyboardEvent,
  shortcuts: Shortcut[]
): Promise<void> {
  const shortcut = shortcuts.find((shortcut) =>
    isShortcutPressed(event, shortcut)
  );
  if (!shortcut) return;

  event.preventDefault();

  const url = new URL(window.location.href);
  url.pathname = await getShortcutPathname(url.pathname, shortcut);
  url.hash = getCurrentSectionHash();

  window.location.href = url.href;
}

export function prefixLinksWithMode(
  container: Element | null,
  mode: string | undefined
): void {
  if (!container || !mode || mode === DefaultMode) return;

  const prefixedHrefs = new WeakMap<HTMLAnchorElement, string>();

  const prefixLinks = () => {
    for (const link of container.querySelectorAll<HTMLAnchorElement>(
      "a[href]"
    )) {
      prefixLink(link, mode, prefixedHrefs);
    }
  };

  prefixLinks();

  new MutationObserver(prefixLinks).observe(container, {
    attributeFilter: ["href"],
    childList: true,
    subtree: true,
  });
}

async function getShortcutPathname(
  pathname: string,
  shortcut: Shortcut
): Promise<string> {
  const currentMode = await getCurrentModeFromPath(pathname);

  return getUpdatedModePathname(
    pathname,
    currentMode === shortcut.mode ? DefaultMode : shortcut.mode
  );
}

function prefixLink(
  link: HTMLAnchorElement,
  mode: string,
  prefixedHrefs: WeakMap<HTMLAnchorElement, string>
): void {
  const href = link.getAttribute("href");
  if (!href || prefixedHrefs.get(link) === href) return;

  const prefixedHref = insertModePathname(href, mode);

  prefixedHrefs.set(link, prefixedHref);
  link.setAttribute("href", prefixedHref);
}

// The view mode switchers rendered from the view modes data are used to recognize links to the other view modes of the
// current page, e.g. in custom switchers using the same data.
function isOtherModeLink(link: HTMLAnchorElement): boolean {
  const url = new URL(link.href);
  const { hash, origin } = window.location;

  return (
    url.origin === origin &&
    // Links to a specific section are kept.
    (url.hash === "" || url.hash === hash) &&
    getModeSwitchPathnames().has(stripTrailingSlash(url.pathname))
  );
}

function getModeSwitchPathnames(): Set<string> {
  const links =
    document.querySelectorAll<HTMLAnchorElement>(SwitcherLinkSelector);

  return new Set(
    [...links].map((link) => stripTrailingSlash(new URL(link.href).pathname))
  );
}

// Returns the hash of the section currently being read, which is the anchor of the current slide in presentations and
// the last heading scrolled to the top of the viewport otherwise.
function getCurrentSectionHash(): string {
  if (document.querySelector("starlight-view-modes-presentation")) {
    return window.location.hash;
  }

  const scrollPaddingTop = parseFloat(
    getComputedStyle(document.documentElement).scrollPaddingTop
  );
  const offset = (scrollPaddingTop || 0) + SectionReadingOffset;
  const headings = document.querySelectorAll<HTMLElement>(
    ".sl-markdown-content :is(h2, h3, h4, h5, h6)[id]"
  );
  const heading = [...headings].findLast(
    (heading) => heading.getBoundingClientRect().top <= offset
  );

  return heading ? `#${heading.id}` : "";
}

function getHrefWithHash(href: string, hash: string): string {
  return `${href.split("#")[0]}${hash}`;
}
