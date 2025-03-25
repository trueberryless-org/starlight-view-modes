import picomatch from "picomatch";
import astroConfig from "virtual:starlight-view-modes-context";

import type { StarlightViewModesConfig } from "./config";
import { AvailableModes } from "./definitions";
import { insertSegment, stripLeadingSlash, stripTrailingSlash } from "./path";

export function getClassNameZenMode(
  displayOptions: StarlightViewModesConfig["zenModeSettings"]["displayOptions"]
): string {
  const displayOptionsKey = getDisplayOptionsKey(displayOptions);

  switch (displayOptionsKey) {
    case "false-false-false-false":
      return "starlight-view-modes-zen-mode";
    case "false-false-false-true":
      return "starlight-view-modes-zen-mode-footer";
    case "false-false-true-false":
      return "starlight-view-modes-zen-mode-table-of-contents";
    case "false-false-true-true":
      return "starlight-view-modes-zen-mode-table-of-contents-footer";
    case "false-true-false-false":
      return "starlight-view-modes-zen-mode-sidebar";
    case "false-true-false-true":
      return "starlight-view-modes-zen-mode-sidebar-footer";
    case "false-true-true-false":
      return "starlight-view-modes-zen-mode-sidebar-table-of-contents";
    case "false-true-true-true":
      return "starlight-view-modes-zen-mode-sidebar-table-of-contents-footer";
    case "true-false-false-false":
      return "starlight-view-modes-zen-mode-header";
    case "true-false-false-true":
      return "starlight-view-modes-zen-mode-header-footer";
    case "true-false-true-false":
      return "starlight-view-modes-zen-mode-header-table-of-contents";
    case "true-false-true-true":
      return "starlight-view-modes-zen-mode-header-table-of-contents-footer";
    case "true-true-false-false":
      return "starlight-view-modes-zen-mode-header-sidebar";
    case "true-true-false-true":
      return "starlight-view-modes-zen-mode-header-sidebar-footer";
    case "true-true-true-false":
      return "starlight-view-modes-zen-mode-header-sidebar-table-of-contents";
    case "true-true-true-true":
      return "starlight-view-modes-zen-mode-header-sidebar-table-of-contents-footer";
    default:
      return "starlight-view-modes-zen-mode";
  }
}

function getDisplayOptionsKey(
  displayOptions: StarlightViewModesConfig["zenModeSettings"]["displayOptions"]
): string {
  const { showHeader, showSidebar, showTableOfContents, showFooter } =
    displayOptions;
  return `${showHeader}-${showSidebar}-${showTableOfContents}-${showFooter}`;
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
  if (["index", "/"].some((indexSlug) => slug.startsWith(indexSlug))) {
    return undefined;
  }
  return slug;
}

/**
 * Appends a mode to a pathname, respecting the base path configuration.
 * If the mode is 'default', the pathname is returned unchanged.
 *
 * @param {string} pathname - The pathname to append the mode to
 * @param {string} mode - The mode to append (e.g., 'dark', 'default')
 * @returns {string} - The pathname with the mode appended
 */
export function appendModePathname(pathname: string, mode: string) {
  // If the mode is default, return the pathname unchanged
  if (mode === "default") {
    return pathname;
  }

  const base = astroConfig?.base || "";
  return insertSegment(pathname, mode, base.split("/").filter(Boolean).length);
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

  if (base && slug.startsWith(`${base}/`)) {
    slug = slug.slice(base.length + 1);
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

  return appendModePathname(cleanedPath, targetMode);
}
