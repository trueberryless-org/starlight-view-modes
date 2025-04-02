import { type CollectionEntry, getCollection, getEntry } from "astro:content";

import { handleIndexSlug, isExcludedPage } from "../libs/utils";
import type { AdditionalMode, AvailableMode } from "./definitions";
import {
  defaultLocale,
  getLocaleFromSlug,
  getLocales,
  getLocalizedSlug,
} from "./i18n";
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
  const locales = getLocales();

  const paths = (
    await Promise.all(
      pages
        .flatMap(async (page: CollectionEntry<"docs">) => {
          if (isExcludedPage(page.id, mode.exclude)) return;
          if (
            getLocaleFromSlug(page.id) &&
            getLocaleFromSlug(page.id) !== defaultLocale
          )
            return;

          const slugWithoutLocale = getLocalizedSlug(page.id, undefined);
          let path = handleIndexSlug(slugWithoutLocale);
          // if (path != undefined) path = handleAstroTrailingSlash(path); // trailingSlash: "never" not supported if path is undefined (#67)

          return Promise.all(
            locales.map(async (locale) => {
              let localizedSlug = stripTrailingSlash(
                getLocalizedSlug(path || "", locale)
              );
              if (localizedSlug == "") localizedSlug = "index";
              let translationPage = await getEntry("docs", localizedSlug);
              return {
                params: { locale, path },
                props: {
                  entry: translationPage ?? page,
                  isFallback: translationPage === undefined,
                },
              };
            })
          );
        })
        .filter(Boolean)
    )
  )
    .flat()
    .filter((p) => p?.params !== undefined);

  return paths.flat();
}
