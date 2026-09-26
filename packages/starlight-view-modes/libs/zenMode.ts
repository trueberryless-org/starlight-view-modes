import type { StarlightPageProps } from "@astrojs/starlight/props";
import type { ImageMetadata } from "astro";
import { type CollectionEntry, render } from "astro:content";
import config from "virtual:starlight-view-modes/config";

import type { ZenModeDisplayOptions } from "./config";
import { ZenMode, getAdditionalMode } from "./modes";
import { isAbsoluteUrl } from "./path";
import { generateStaticPaths } from "./server";
import { insertModePathname } from "./utils";

const ClassNamePrefix = "starlight-view-modes-zen-mode";

const displayOptionNames: Record<keyof ZenModeDisplayOptions, string> = {
  showHeader: "header",
  showSidebar: "sidebar",
  showTableOfContents: "table-of-contents",
  showFooter: "footer",
};

export async function getZenModeStaticPaths() {
  const mode = getAdditionalMode(ZenMode);

  return mode ? generateStaticPaths(mode) : [];
}

export async function getZenModePage(
  entry: CollectionEntry<"docs">,
  isFallback: boolean
): Promise<ZenModePage> {
  const { headings, remarkPluginFrontmatter } = await render(entry);
  const hasSidebar: boolean | undefined = remarkPluginFrontmatter["hasSidebar"];

  return {
    classes: resolveZenModeClasses(config.zenModeSettings.displayOptions),
    props: {
      frontmatter: resolveZenModeFrontmatter(
        remarkPluginFrontmatter,
        entry.data.hero?.image
      ),
      headings,
      isFallback,
      ...(hasSidebar === undefined ? {} : { hasSidebar }),
    },
  };
}

export function resolveZenModeClasses(
  displayOptions: ZenModeDisplayOptions
): string[] {
  const options = Object.keys(
    displayOptionNames
  ) as (keyof ZenModeDisplayOptions)[];
  const visibleElements = options.filter((option) => displayOptions[option]);
  const hiddenElements = options.filter((option) => !displayOptions[option]);

  return [
    [
      ClassNamePrefix,
      ...visibleElements.map((option) => displayOptionNames[option]),
    ].join("-"),
    ...hiddenElements.map(
      (option) => `${ClassNamePrefix}-no-${displayOptionNames[option]}`
    ),
  ];
}

export function resolveZenModeFrontmatter(
  frontmatter: Record<string, unknown>,
  heroImage: unknown
): StarlightPageProps["frontmatter"] {
  const hero = resolveZenModeHero(
    frontmatter["hero"] as HeroFrontmatter | undefined,
    resolveHeroImage(heroImage)
  );

  return {
    ...(frontmatter as StarlightPageProps["frontmatter"]),
    ...(hero ? { hero } : {}),
    pagefind: false,
  };
}

function resolveZenModeHero(
  hero: HeroFrontmatter | undefined,
  image: HeroImage | undefined
): HeroFrontmatter | undefined {
  const zenModeHero: HeroFrontmatter | undefined = hero
    ? { ...hero, ...(image ? { image } : {}) }
    : image && { image };

  if (!zenModeHero?.actions?.length) return zenModeHero;

  return {
    ...zenModeHero,
    actions: zenModeHero.actions.map(resolveHeroAction),
  };
}

function resolveHeroAction(action: HeroAction): HeroAction {
  if (typeof action.link !== "string" || isAbsoluteUrl(action.link)) {
    return action;
  }

  return { ...action, link: insertModePathname(action.link, ZenMode) };
}

function resolveHeroImage(image: unknown): HeroImage | undefined {
  if (!image || typeof image !== "object") return undefined;
  if ("dark" in image && "light" in image) {
    return { dark: image.dark, light: image.light } as HeroImage;
  }
  if ("file" in image) return { file: image.file } as HeroImage;
  if ("html" in image) return { html: image.html } as HeroImage;

  return undefined;
}

type HeroImage =
  | { file: ImageMetadata }
  | { dark: ImageMetadata; light: ImageMetadata }
  | { html: string };

interface HeroAction {
  link?: unknown;
  [key: string]: unknown;
}

interface HeroFrontmatter {
  actions?: HeroAction[];
  image?: HeroImage;
  [key: string]: unknown;
}

interface ZenModePage {
  classes: string[];
  props: StarlightPageProps;
}
