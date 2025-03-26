import { type CollectionEntry, getCollection } from "astro:content";

import { handleIndexSlug, isExcludedPage } from "../libs/utils";
import type { AdditionalMode, AvailableMode } from "./definitions";
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

export async function generateStaticPaths(mode: AdditionalMode) {
  const pages = await getCollection("docs");

  const paths = pages
    .map((page: CollectionEntry<"docs">) => {
      if (isExcludedPage(page.id, mode.exclude)) return;
      return {
        params: { path: handleIndexSlug(page.id) },
        props: { entry: page },
      };
    })
    .filter(Boolean);

  return paths;
}
