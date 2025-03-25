import { type CollectionEntry, getCollection } from "astro:content";

import { getCurrentModeFromPath as getCurrentModeFromPathWithoutDocs } from "./modeClient";
import { appendModePathname } from "./modeClient";
import { stripLeadingSlash, stripTrailingSlash } from "./path";

/**
 * Get the active view mode
 * @param pathname The current URL path
 * @returns The active view mode as a string; "default" if no mode is active
 */
export async function getCurrentModeFromPath(
  pathname: string
): Promise<string> {
  let slug = stripLeadingSlash(stripTrailingSlash(pathname));

  const allSlugs = (await getCollection("docs")).map(
    (doc: CollectionEntry<"docs">) =>
      stripLeadingSlash(stripTrailingSlash(doc.id))
  );

  if (allSlugs.includes(slug)) return "default";

  return getCurrentModeFromPathWithoutDocs(slug);
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
