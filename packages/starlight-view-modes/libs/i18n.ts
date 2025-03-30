import type { APIContext } from "astro";
import { AstroError } from "astro/errors";
import astroConfig from "virtual:starlight-view-modes-context";
import starlightConfig from "virtual:starlight/user-config";

import { stripLeadingSlash, stripTrailingSlash } from "./path";

const defaultLang =
  starlightConfig.defaultLocale.lang ??
  starlightConfig.defaultLocale.locale ??
  "en";

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
    return stripTrailingSlash(
      `${hasLeadingSlash ? "/" : ""}${slug
        .replace(`${slugLocale}/`, locale ? `${locale}/` : "")
        .replace(/^\/+/, "")}`
    );
  }

  return hasLeadingSlash
    ? `/${locale}${slug}`
    : `${locale}${slug ? `/${slug}` : ""}`;
}

export function removeLocaleFromSlug(slug: string): string {
  const slugLocale = getLocaleFromSlug(slug);
  return slugLocale
    ? slug.includes(`${slugLocale}/`)
      ? slug.replace(`${slugLocale}/`, "")
      : slug.replace(`${slugLocale}`, "")
    : slug;
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

export function getTranslation(
  currentLocale: APIContext["currentLocale"],
  translations: Record<string, string>,
  link: string,
  description: string
) {
  const defaultTranslation = translations[defaultLang];

  if (!defaultTranslation) {
    throw new AstroError(
      `The ${description} for "${link}" must have a key for the default language "${defaultLang}".`,
      "Update the Starlight config to include a topic label for the default language."
    );
  }

  let translation = defaultTranslation;

  if (currentLocale) {
    translation = translations[currentLocale] ?? defaultTranslation;
  }

  return translation;
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
  exclude.map(removeLocaleFromSlug);
  const locales = getLocales();
  return locales
    .map((locale) =>
      exclude.map((e) => getLocalizedSlug(e, locale)).map(stripLeadingSlash)
    )
    .flat();
}
