import { type Shortcut, isShortcutPressed } from "./shortcuts";
import {
  getCurrentModeFromPath,
  getUpdatedModePathname,
  insertModePathname,
} from "./utils";

const DefaultMode = "default";
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

export async function switchModeWithShortcut(
  event: KeyboardEvent,
  shortcuts: Shortcut[]
): Promise<void> {
  const shortcut = shortcuts.find((shortcut) =>
    isShortcutPressed(event, shortcut)
  );
  if (!shortcut) return;

  event.preventDefault();

  window.location.pathname = await getShortcutPathname(
    window.location.pathname,
    shortcut
  );
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
    currentMode === DefaultMode ? shortcut.mode : DefaultMode
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

function getHrefWithHash(href: string, hash: string): string {
  return `${href.split("#")[0]}${hash}`;
}
