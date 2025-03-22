import astroConfig from "virtual:starlight-view-modes-context";

import { AVAILABLE_MODES } from "../constants";
import { insertSegment, stripLeadingSlash, stripTrailingSlash } from "./path";

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
    AVAILABLE_MODES.find((mode) => slug.startsWith(`${mode}`)) || "default"
  );
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
