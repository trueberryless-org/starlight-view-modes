import picomatch from "picomatch";
import astroConfig from "virtual:starlight-view-modes-context";

import type { StarlightViewModesConfig } from "./config";
import { AvailableModes } from "./definitions";
import { getLocaleFromSlug } from "./i18n";
import { insertSegment, stripLeadingSlash, stripTrailingSlash } from "./path";

export function getClassNameZenMode(
  displayOptions: StarlightViewModesConfig["zenModeSettings"]["displayOptions"]
): string {
  const parts: string[] = [];

  if (displayOptions.showHeader) parts.push("header");
  if (displayOptions.showSidebar) parts.push("sidebar");
  if (displayOptions.showTableOfContents) parts.push("table-of-contents");
  if (displayOptions.showFooter) parts.push("footer");

  return parts.length
    ? `starlight-view-modes-zen-mode-${parts.join("-")}`
    : "starlight-view-modes-zen-mode";
}

/**
 * Check if the current URL pathname should be excluded from view mode switching
 * @param path The current URL pathname to check
 * @param exclude An array of glob patterns to exclude
 * @returns Whether the current URL pathname should be excluded
 */
export function isExcludedPage(path: string, exclude: string[]): boolean {
  return picomatch(exclude)(path);
}

/**
 * Filter out index slugs by returning undefined if the slug is an index page
 * @param slug The current URL pathname
 * @returns Undefined if the slug is an index page, otherwise the slug
 */
export function handleIndexSlug(slug: string): string | undefined {
  if (slug === "") return undefined;
  if (["index", "/"].some((indexSlug) => slug.startsWith(indexSlug))) {
    return undefined;
  }
  return slug;
}

/**
 * Insert a mode to a pathname, respecting the base path configuration and i18n.
 * If the mode is 'default', the pathname is returned unchanged.
 *
 * @param {string} pathname - The pathname to append the mode to including the base and locale
 * @param {string} mode - The mode to append (e.g., 'zen-mode', 'default')
 * @returns {string} - The pathname with the mode correctly inserted
 */
export function insertModePathname(pathname: string, mode: string) {
  // If the mode is default, return the pathname unchanged
  if (mode === "default") {
    return pathname;
  }

  const base = astroConfig?.base || "";
  const locale = getLocaleFromSlug(pathname);
  const insertionPosition =
    base.split("/").filter(Boolean).length + (locale ? 1 : 0);
  return insertSegment(pathname, mode, insertionPosition);
}

/**
 * Get the active view mode
 * @param pathname The current URL path
 * @returns The active view mode as a string; "default" if no mode is active
 */
export async function getCurrentModeFromPath(
  pathname: string
): Promise<string> {
  let slug = stripLeadingSlash(stripTrailingSlash(pathname));
  const base = stripLeadingSlash(stripTrailingSlash(astroConfig.base));
  const locale = getLocaleFromSlug(slug);

  if (base) {
    slug = slug.startsWith(`${base}/`)
      ? slug.slice(base.length + 1)
      : slug.startsWith(`${base}`)
        ? slug.slice(base.length)
        : slug;
  }

  if (locale) {
    slug = slug.startsWith(`${locale}/`)
      ? slug.slice(locale.length + 1)
      : slug.startsWith(`${locale}`)
        ? slug.slice(locale.length)
        : slug;
  }

  return (
    AvailableModes.find((mode) => slug.startsWith(`${mode.name}`))?.name ||
    "default"
  );
}

/**
 * Get the target URL path based on the current URL path and the target mode
 * @param pathname The current URL path
 * @param targetMode The mode you want to switch to
 * @returns The updated URL path
 */
export async function getUpdatedModePathname(
  pathname: string,
  targetMode: string
): Promise<string> {
  targetMode = stripLeadingSlash(stripTrailingSlash(targetMode));

  const currentMode = await getCurrentModeFromPath(pathname);
  if (currentMode === targetMode) return pathname;

  // If switching back to "default", remove the current mode
  if (targetMode === "default") {
    return pathname.includes(`${currentMode}/`)
      ? pathname.replace(`${currentMode}/`, "")
      : pathname.replace(`${currentMode}`, "");
  }

  // If currently in a mode, remove it before inserting the new mode
  let cleanedPath = pathname;
  if (currentMode !== "default") {
    cleanedPath = pathname.includes("/")
      ? pathname.replace(`${currentMode}/`, "")
      : pathname.replace(`${currentMode}`, "");
  }

  return insertModePathname(cleanedPath, targetMode);
}
