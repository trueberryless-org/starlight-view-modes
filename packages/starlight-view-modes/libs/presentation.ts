import type { CollectionEntry } from "astro:content";
import { fromHtml } from "hast-util-from-html";
import config from "virtual:starlight-view-modes/config";

import type { DeckOptions } from "./deck";
import { prefixTreeInternalLinks } from "./html";
import { PresentationMode } from "./modes";
import { type SlideDeck, getSlides } from "./slides";

// This module must not import anything from `astro:content` at runtime so that the presentation component rendering
// the page content is not treated as a head propagator and rendered before the Starlight route data is available.
export function getPresentation(
  html: string,
  entry: CollectionEntry<"docs">
): Presentation {
  const tree = fromHtml(html, { fragment: true });

  prefixTreeInternalLinks(tree, PresentationMode);

  return {
    deck: getSlides(tree, {
      description: entry.data.description ?? entry.data.hero?.tagline,
      splitHeadingLevel: config.presentationModeSettings.splitHeadingLevel,
      title: entry.data.title,
    }),
    options: {
      slideNumber: config.presentationModeSettings.slideNumber,
      transition: config.presentationModeSettings.transition,
    },
  };
}

interface Presentation {
  deck: SlideDeck;
  options: DeckOptions;
}
