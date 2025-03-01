import type { GetStaticPathsResult } from "astro";
import {
  type CollectionEntry,
  getCollection,
  getEntry,
  render,
} from "astro:content";
import { DefaultLocale, getLangFromLocale, type Locale } from "./i18n";
import starlightConfig from "virtual:starlight/user-config";
import config from "virtual:starlight-view-modes-config";

export function replicateStarlightSite(
  config: {
    mode: string;
    entrypoint: string;
  },
  hooks: {
    injectRoute: (config: {
      pattern: string;
      entrypoint: string | URL;
      prerender?: boolean;
    }) => void;
    addRouteMiddleware: (config: {
      entrypoint: string;
      order?: "pre" | "post" | "default";
    }) => void;
  }
) {
  hooks.injectRoute({
    entrypoint: config.entrypoint,
    pattern: `[...locale]/${config.mode}/[...path]`,
    prerender: true,
  });
}

export async function getReplicaStaticPaths() {
  const paths = [];

  if (starlightConfig.isMultilingual) {
    for (const localeKey of Object.keys(starlightConfig.locales)) {
      const locale = localeKey === "root" ? undefined : localeKey;

      const pages = getPages(locale);
    }
  }

  const gettingStarted = docs.find((doc: any) => doc.id === "getting-started");
  console.log(gettingStarted);

  return [
    {
      params: { path: "getting-started", locale: "" },
      props: { doc: gettingStarted },
    },
  ] satisfies GetStaticPathsResult;

  return paths satisfies GetStaticPathsResult;
}

function getReplicaStaticPath(
  prefix: Locale,
  slug: string,
  page: StarlightEntry
) {
  return {
    params: {
      prefix,
      path: slug,
    },
    props: {
      page,
    },
  };
}

async function getPages(locale: Locale): Promise<StarlightEntry[]> {
  const docs = await getCollection("docs");
  const pages: StarlightEntry[] = [];

  for (const entry of docs) {
    // if (isExcludedPage(entry.id, config.zenModeSettings.exclude)) continue;
    // alle docs von defaultLocale und dann alle seiten von anderen locales (auch wenn nicht gibt)
  }

  return pages;
}

type StarlightEntry = CollectionEntry<"docs">;
