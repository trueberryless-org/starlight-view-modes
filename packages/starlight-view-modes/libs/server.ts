import { type CollectionEntry, getCollection, getEntry } from "astro:content";

import {
  defaultLocale,
  getLocaleFromSlug,
  getLocales,
  getLocalizedSlug,
} from "./i18n";
import type { AdditionalMode, AvailableMode } from "./modes";
import { stripLeadingSlash, stripTrailingSlash } from "./path";
import {
  getCurrentModeFromPath as getCurrentModeFromPathname,
  handleIndexSlug,
  isExcludedPage,
} from "./utils";

export async function getCurrentModeFromPath(
  pathname: string
): Promise<AvailableMode["name"]> {
  const slug = normalizeSlug(pathname);
  const docs = await getCollection("docs");

  if (docs.some((doc) => normalizeSlug(doc.id) === slug)) return "default";

  return getCurrentModeFromPathname(slug);
}

export async function generateStaticPaths(mode: AdditionalMode) {
  const pages = await getCollection("docs");
  const paths = await Promise.all(
    pages
      .filter((page) => isDefaultLocalePage(page, mode))
      .map((page) => getPagePaths(page))
  );

  return paths.flat();
}

function isDefaultLocalePage(
  page: CollectionEntry<"docs">,
  mode: AdditionalMode
): boolean {
  if (isExcludedPage(page.id, mode.exclude)) return false;

  const locale = getLocaleFromSlug(page.id);

  return !locale || locale === defaultLocale;
}

function getPagePaths(page: CollectionEntry<"docs">) {
  const path = handleIndexSlug(getLocalizedSlug(page.id, undefined));

  return Promise.all(
    getLocales().map((locale) => getLocalizedPagePath(page, path, locale))
  );
}

async function getLocalizedPagePath(
  page: CollectionEntry<"docs">,
  path: string | undefined,
  locale: string | undefined
) {
  const translationPage = await getEntry(
    "docs",
    getLocalizedEntryId(path, locale)
  );

  return {
    params: { locale, path },
    props: {
      entry: translationPage ?? page,
      isFallback: translationPage === undefined,
    },
  };
}

function getLocalizedEntryId(
  path: string | undefined,
  locale: string | undefined
): string {
  const id = stripTrailingSlash(getLocalizedSlug(path ?? "", locale));

  return id === "" ? "index" : id;
}

function normalizeSlug(slug: string): string {
  return stripLeadingSlash(stripTrailingSlash(slug));
}
