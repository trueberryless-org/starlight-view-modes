import { type CollectionEntry, getCollection, getEntry } from "astro:content";

import { isExcludedPage } from "./exclude";
import {
  defaultLocale,
  getLocaleFromSlug,
  getLocales,
  getLocalizedSlug,
} from "./i18n";
import { type AdditionalMode, type AvailableMode, ZenMode } from "./modes";
import { stripLeadingSlash, stripTrailingSlash } from "./path";
import {
  getCurrentModeFromPath as getCurrentModeFromPathname,
  getPageKey,
  handleIndexSlug,
} from "./utils";

export async function getCurrentModeFromPath(
  pathname: string
): Promise<AvailableMode["name"]> {
  const slug = normalizeSlug(pathname);
  const docs = await getCollection("docs");

  if (docs.some((doc) => normalizeSlug(doc.id) === slug)) return "default";

  return getCurrentModeFromPathname(slug);
}

const modePagesCache = new Map<AdditionalMode["name"], Promise<Set<string>>>();

// Additional modes only exist for pages of the docs collection, and not for other pages rendered using Starlight, e.g.
// pages injected by other plugins.
export function getModePages(mode: AdditionalMode): Promise<Set<string>> {
  // The docs collection can change during development.
  if (import.meta.env.DEV) return loadModePages(mode);

  let pages = modePagesCache.get(mode.name);

  if (!pages) {
    pages = loadModePages(mode);
    modePagesCache.set(mode.name, pages);
  }

  return pages;
}

async function loadModePages(mode: AdditionalMode): Promise<Set<string>> {
  const pages = await getCollection("docs");

  return new Set(
    pages
      .filter((page) => isDefaultLocalePage(page, mode))
      .map((page) =>
        getPageKey(handleIndexSlug(getLocalizedSlug(page.id, undefined)) ?? "")
      )
  );
}

export function hasModePage(pages: Set<string>, slug: string): boolean {
  return pages.has(
    getPageKey(getLocalizedSlug(normalizeSlug(slug), undefined))
  );
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
  // Splash pages have no sidebar or table of contents to hide, and no page title to display the view mode switcher.
  if (mode.name === ZenMode && page.data.template === "splash") return false;

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
