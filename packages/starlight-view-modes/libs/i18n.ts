import context from "virtual:starlight-view-modes/context";

import { insertSegment, isSamePathStart, stripLeadingSlash } from "./path";

const RootLocale = "root";

export const defaultLocale = context.defaultLocale ?? "en";

export function getLocalizedSlug(
  slug: string,
  locale: string | undefined
): string {
  const slugLocale = getLocaleFromSlug(slug);

  if (slugLocale === locale || !isKnownLocale(locale)) return slug;
  if (slugLocale === slug) return locale ?? "";
  if (slugLocale) return replaceSlugLocale(slug, slugLocale, locale ?? "");

  return insertSegment(slug, locale ?? "", getBaseSegmentCount(slug));
}

export function getLocaleFromSlug(slug: string): string | undefined {
  const slugSegments = stripLeadingSlash(slug).split("/");
  const possibleLocale = slugSegments[getBaseSegmentCount(slug)];

  return possibleLocale && context.locales.includes(possibleLocale)
    ? possibleLocale
    : undefined;
}

export function getLocales(): (string | undefined)[] {
  return [
    context.locales.includes(RootLocale) ? undefined : context.defaultLocale,
    ...context.locales.filter(
      (locale) => locale !== context.defaultLocale && locale !== RootLocale
    ),
  ];
}

export function getLocalizedExclude(exclude: string[]): string[] {
  return getLocales().flatMap((locale) =>
    exclude.map((pattern) => getLocalizedSlug(pattern, locale))
  );
}

function isKnownLocale(locale: string | undefined): boolean {
  return locale === undefined || getLocales().includes(locale);
}

function replaceSlugLocale(
  slug: string,
  slugLocale: string,
  locale: string
): string {
  const leadingSlash = slug.startsWith("/") ? "/" : "";
  const localizedSlug = slug
    .replace(`${slugLocale}/`, locale ? `${locale}/` : "")
    .replace(/^\/+/, "");

  return `${leadingSlash}${localizedSlug}`;
}

function getBaseSegmentCount(slug: string): number {
  const base = context.base || "";

  return isSamePathStart(slug, base)
    ? base.split("/").filter(Boolean).length
    : 0;
}
