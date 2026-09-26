import type { StarlightPageProps } from "@astrojs/starlight/props";
import type { CollectionEntry } from "astro:content";

import { PresentationMode, getAdditionalMode } from "./modes";
import { generateStaticPaths } from "./server";

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
