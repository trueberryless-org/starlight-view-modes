import { type CollectionEntry, getCollection } from "astro:content";
import astroConfig from "virtual:starlight-view-modes-context";

import { stripLeadingSlash, stripTrailingSlash } from "./path";

const AVAILABLE_MODES = ["zen-mode"];

/**
 * Get the active view mode
 * @param pathname The current URL path
 * @returns The active view mode in a string format; "default" if no mode is active
 */
export async function getCurrentMode(pathname: string): Promise<string> {
  let slug = stripLeadingSlash(stripTrailingSlash(pathname));
  const astroConfigBase = stripLeadingSlash(
    stripTrailingSlash(astroConfig.base)
  );

  const allSlugs: string[] = (await getCollection("docs")).map(
    (doc: CollectionEntry<"docs">) =>
      stripLeadingSlash(stripTrailingSlash(doc.id))
  );
  if (allSlugs.includes(slug)) return "default";

  if (slug.startsWith(astroConfigBase))
    slug = slug.slice(astroConfigBase.length + 1);

  for (const mode of AVAILABLE_MODES) {
    if (slug.startsWith(`${mode}/`)) {
      return mode;
    }
  }
  return "default";
}

/**
 * Get the target URL path based on the current URL path and the target mode
 * @param pathname The current URL path
 * @param targetMode The mode you want to switch to
 * @returns The target URL path
 */
export async function getUpdatedModePathname(
  pathname: string,
  targetMode: string
): Promise<string> {
  targetMode = stripLeadingSlash(stripTrailingSlash(targetMode));
  let slug = stripLeadingSlash(pathname);
  const astroConfigBase = stripLeadingSlash(
    stripTrailingSlash(astroConfig.base)
  );
  const currentMode = await getCurrentMode(pathname);

  if (currentMode == targetMode) return pathname;

  if (currentMode == "default") {
    if (slug.startsWith(astroConfigBase))
      slug = slug.slice(astroConfigBase.length + 1);
    return `/${astroConfigBase != "" ? `${astroConfigBase}/` : ""}${targetMode}/${slug}`;
  }

  if (targetMode == "default") {
    if (slug.startsWith(astroConfigBase))
      slug = slug.slice(astroConfigBase.length + 1);
    if (slug.startsWith(currentMode)) slug = slug.slice(currentMode.length + 1);
    return `/${astroConfigBase != "" ? `${astroConfigBase}/` : ""}${slug}`;
  }

  return pathname.replace(`${currentMode}`, `${targetMode}`);
}
