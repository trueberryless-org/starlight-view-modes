import type { APIContext } from "astro";
import { AstroError } from "astro/errors";
import starlightConfig from "virtual:starlight/user-config";

import { stripTrailingSlash } from "./path";

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
  if (slugLocale === locale) return slug;
  locale ??= "";
  if (slugLocale === slug) return locale;

  if (slugLocale) {
    return stripTrailingSlash(
      slug.replace(`${slugLocale}/`, locale ? `${locale}/` : "")
    );
  }

  return slug ? `${locale}/${slug}` : locale;
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
  const baseSegment = slug.split("/")[0];
  return baseSegment && locales.includes(baseSegment) ? baseSegment : undefined;
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
