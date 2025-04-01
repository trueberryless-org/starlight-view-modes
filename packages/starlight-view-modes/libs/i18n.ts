import astroConfig from "virtual:starlight-view-modes-context";
import starlightConfig from "virtual:starlight/user-config";

import { insertSegment, stripLeadingSlash } from "./path";

export const defaultLocale = starlightConfig.defaultLocale.locale ?? "en";

export function getLocalizedSlug(
  slug: string,
  locale: string | undefined
): string {
  const slugLocale = getLocaleFromSlug(slug);
  const allLocales = getLocales();
  if (
    slugLocale === locale ||
    (!allLocales.includes(locale) && locale !== undefined)
  )
    return slug;
  locale ??= "";
  if (slugLocale === slug) return locale;

  const hasLeadingSlash = slug.startsWith("/");

  if (slugLocale) {
    return `${hasLeadingSlash ? "/" : ""}${slug
      .replace(`${slugLocale}/`, locale ? `${locale}/` : "")
      .replace(/^\/+/, "")}`;
  }

  const base = astroConfig?.base || "";
  const insertionPosition = base.split("/").filter(Boolean).length;
  return insertSegment(slug, locale, insertionPosition);
}

export function getLocaleFromSlug(slug: string): string | undefined {
  const locales = Object.keys(starlightConfig.locales ?? {});
  const baseSegments = (astroConfig?.base || "").split("/").filter(Boolean);
  const slugSegments = stripLeadingSlash(slug).split("/");

  const possibleLocaleIndex = baseSegments.length;
  const possibleLocale = slugSegments[possibleLocaleIndex];

  return possibleLocale && locales.includes(possibleLocale)
    ? possibleLocale
    : undefined;
}

export function getLocales(): (string | undefined)[] {
  const { locales = {}, defaultLocale } = starlightConfig;
  return [
    locales === undefined || locales.root ? undefined : defaultLocale.locale,
    ...Object.keys(locales).filter(
      (locale) => locale !== defaultLocale.locale && locale !== "root"
    ),
  ];
}

export function getLocalizedExclude(exclude: string[]): string[] {
  exclude.map((e) => getLocalizedSlug(e, undefined));
  const locales = getLocales();
  return locales
    .map((locale) => exclude.map((e) => getLocalizedSlug(e, locale)))
    .flat();
}
