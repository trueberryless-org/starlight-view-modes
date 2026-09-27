import type { StarlightPageProps } from "@astrojs/starlight/props";
import { type CollectionEntry, getCollection } from "astro:content";

import { PresentationMode, getAdditionalMode } from "./modes";
import { generateStaticPaths } from "./server";
import { getPageKey } from "./utils";

export async function getPresentationModeStaticPaths() {
  const mode = getAdditionalMode(PresentationMode);

  return mode ? generateStaticPaths(mode) : [];
}

export function getPresentationModePageProps(
  entry: CollectionEntry<"docs">,
  isFallback: boolean
): StarlightPageProps {
  const { description, head, title } = entry.data;

  return {
    frontmatter: {
      title,
      ...(description ? { description } : {}),
      head,
      template: "splash",
      editUrl: false,
      lastUpdated: false,
      pagefind: false,
      tableOfContents: false,
    },
    hasSidebar: false,
    isFallback,
  };
}

let pageDescriptions: Promise<PageDescriptions> | undefined;

// Page descriptions are used by the contents to preview pages as their presentation would start.
export function getPageDescriptions(): Promise<PageDescriptions> {
  // The docs collection can change during development.
  if (import.meta.env.DEV) return loadPageDescriptions();

  pageDescriptions ??= loadPageDescriptions();

  return pageDescriptions;
}

async function loadPageDescriptions(): Promise<PageDescriptions> {
  const pages = await getCollection("docs");

  return Object.fromEntries(
    pages.flatMap((page) =>
      page.data.description
        ? [[getPageKey(page.id), page.data.description]]
        : []
    )
  );
}

export type PageDescriptions = Record<string, string>;
