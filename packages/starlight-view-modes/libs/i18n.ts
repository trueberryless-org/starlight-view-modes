import starlightConfig from "virtual:starlight/user-config";
import { i18nSchema } from "@astrojs/starlight/schema";
import type { z } from "astro/zod";

export const DefaultLocale =
  starlightConfig.defaultLocale.locale === "root"
    ? undefined
    : starlightConfig.defaultLocale.locale;

export function getLangFromLocale(locale: Locale): string {
  const lang = locale
    ? starlightConfig.locales?.[locale]?.lang
    : starlightConfig.locales?.root?.lang;
  const defaultLang =
    starlightConfig.defaultLocale.lang ?? starlightConfig.defaultLocale.locale;
  return lang ?? defaultLang ?? "en";
}

export function splitPathnameIntoLocaleAndPath(pathname: string): {
  locale: Locale;
  pathname: string | undefined;
} {
  if (starlightConfig.isMultilingual) {
    const [locale, ...path] = pathname.split("/");

    // Check if the locale is valid
    if (locale && starlightConfig.locales[locale]) {
      return { locale, pathname: path.join("/") || undefined };
    }
  }
  return { locale: undefined, pathname };
}

export type Locale = string | undefined;

type StarlightKeys = keyof z.infer<ReturnType<typeof i18nSchema>>;
