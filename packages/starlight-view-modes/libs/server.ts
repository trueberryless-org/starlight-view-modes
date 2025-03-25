import { type CollectionEntry, getCollection } from "astro:content";

import type { AvailableMode } from "./definitions";
import { stripLeadingSlash, stripTrailingSlash } from "./path";
import { getCurrentModeFromPath as getCurrentModeFromPathWithoutDocs } from "./utils";

/**
 * Get the active view mode
 * @param pathname The current URL path
 * @returns The active view mode as a string; "default" if no mode is active
 */
export async function getCurrentModeFromPath(
  pathname: string
): Promise<AvailableMode["name"]> {
  let slug = stripLeadingSlash(stripTrailingSlash(pathname));

  const allSlugs = (await getCollection("docs")).map(
    (doc: CollectionEntry<"docs">) =>
      stripLeadingSlash(stripTrailingSlash(doc.id))
  );

  if (allSlugs.includes(slug)) return "default";

  return getCurrentModeFromPathWithoutDocs(slug);
}
