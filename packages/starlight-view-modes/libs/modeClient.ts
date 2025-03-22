import astroConfig from "virtual:starlight-view-modes-context";

import { insertSegment } from "./path";

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
