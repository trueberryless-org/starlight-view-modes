import type { Element, ElementContent, Root, RootContent } from "hast";
import { toHtml } from "hast-util-to-html";
import { visit } from "unist-util-visit";

import {
  createElement,
  getHeadingRank,
  getId,
  getText,
  hasClassName,
  isElement,
  isElementContent,
  isNotes,
} from "./hast";
import {
  KeepClassName,
  getBlockLines,
  getLines,
  getSlideCapacity,
  isKeep,
  layoutBlocks,
} from "./slideLayout";

const MaxTitleIntroLines = 4;
// Sections of headings of this rank or deeper are placed vertically below the slides of their parent section.
const VerticalHeadingRank = 4;

const HeadingWrapperClassName = "sl-heading-wrapper";
const CounterClassName = "starlight-view-modes-presentation-counter";
const DescriptionClassName = "starlight-view-modes-presentation-description";

const directivePattern =
  /^\s*presentation:\s*(break|hide start|hide end|keep start|keep end)\s*$/;

export function getSlides(tree: Root, options: SlidesOptions): SlideDeck {
  const [introGroup, ...groups] = getSectionGroups(
    getSections(tree.children, options)
  );
  const intro =
    introGroup?.sections.length === 1 ? introGroup.sections[0] : undefined;
  const hasTitleIntro =
    intro !== undefined && getLines(intro.blocks) <= MaxTitleIntroLines;

  const stacks = [
    [getTitleSlide(options, hasTitleIntro ? intro.blocks : [])],
    ...(introGroup && !hasTitleIntro
      ? getGroupSlides(introGroup.sections).map((slide) => [slide])
      : []),
  ];

  for (const group of groups) {
    const slides = getGroupSlides(group.sections);

    if (group.isVertical) {
      stacks.at(-1)?.push(...slides);
    } else {
      stacks.push(...slides.map((slide) => [slide]));
    }
  }

  return { stacks, outline: getOutline(stacks) };
}

function getSections(
  nodes: RootContent[],
  { splitHeadingLevel, title }: SlidesOptions
): Section[] {
  let current: Section = {
    blocks: [],
    breadcrumbs: [title],
    heading: undefined,
    rank: undefined,
    isContinuation: false,
  };
  const sections = [current];
  const ancestors: { rank: number; title: string }[] = [];
  let keep: Element | undefined;
  let isHidden = false;

  for (const node of nodes) {
    if (!isElementContent(node)) continue;

    const directive = getDirective(node);

    if (directive === "hide end") {
      isHidden = false;
      continue;
    }
    if (isHidden) continue;

    const heading = getHeading(node);
    const rank = heading ? getHeadingRank(heading) : undefined;

    if (heading && rank !== undefined && rank <= splitHeadingLevel) {
      while ((ancestors.at(-1)?.rank ?? 0) >= rank) ancestors.pop();

      current = {
        blocks: [],
        breadcrumbs: [title, ...ancestors.map((ancestor) => ancestor.title)],
        heading,
        rank,
        isContinuation: false,
      };
      sections.push(current);
      ancestors.push({ rank, title: getText(heading) });
      keep = undefined;
    } else if (directive === "break" || isElement(node, "hr")) {
      current = { ...current, blocks: [], isContinuation: true };
      sections.push(current);
      keep = undefined;
    } else if (directive === "hide start") {
      isHidden = true;
    } else if (directive === "keep start") {
      keep = createElement("div", KeepClassName, []);
      current.blocks.push(keep);
    } else if (directive === "keep end") {
      keep = undefined;
    } else {
      (keep?.children ?? current.blocks).push(heading ?? node);
    }
  }

  return sections;
}

// Groups sections with their continuations and determines which groups are placed vertically below the slides of
// their parent section instead of horizontally.
function getSectionGroups(sections: Section[]): SectionGroup[] {
  const groups: SectionGroup[] = [];
  let hasParentSection = false;

  for (const section of sections) {
    const group = groups.at(-1);

    if (group && section.isContinuation) {
      group.sections.push(section);
      continue;
    }

    const isVertical: boolean =
      hasParentSection &&
      section.rank !== undefined &&
      section.rank >= VerticalHeadingRank;

    groups.push({ sections: [section], isVertical });
    hasParentSection ||= section.rank !== undefined && !isVertical;
  }

  return groups;
}

function getGroupSlides(sections: Section[]): Slide[] {
  const parts = sections
    .filter(
      (section) =>
        (section.heading && !section.isContinuation) ||
        getLines(section.blocks) > 0
    )
    .flatMap((section) =>
      layoutBlocks(
        section.blocks,
        getSlideCapacity(section.heading !== undefined)
      ).map((nodes, index) => ({
        section,
        nodes,
        isContinuation: section.isContinuation || index > 0,
      }))
    );

  return parts.map((part, index) =>
    getSlide(
      part,
      parts.length > 1 ? `${index + 1}/${parts.length}` : undefined
    )
  );
}

function getTitleSlide(
  { description, title }: SlidesOptions,
  blocks: ElementContent[]
): Slide {
  const { content, notes } = extractNotes(blocks);
  const children: ElementContent[] = [createElement("h1", undefined, title)];

  if (description) {
    children.push(createElement("p", DescriptionClassName, description));
  }

  children.push(...content.flatMap(unwrapKeep));

  return {
    anchor: undefined,
    breadcrumbs: [],
    html: toHtml(children),
    notes: getNotesHtml(notes),
    outline: undefined,
    type: "title",
  };
}

function getSlide(part: SlidePart, counter: string | undefined): Slide {
  const { breadcrumbs, heading, rank } = part.section;
  const { content, notes } = extractNotes(part.nodes);
  const children: ElementContent[] = [];

  if (heading) {
    children.push(getSlideHeading(heading, part.isContinuation, counter));
  }

  children.push(...content.flatMap(unwrapKeep));

  return {
    anchor: getId(heading),
    breadcrumbs,
    html: toHtml(children),
    notes: getNotesHtml(notes),
    outline:
      heading &&
      rank !== undefined &&
      rank < VerticalHeadingRank &&
      !part.isContinuation
        ? { rank, title: getText(heading) }
        : undefined,
    type: content.some((node) => getBlockLines(node) > 0)
      ? "content"
      : "divider",
  };
}

// Only the first slide of a section keeps the heading ID to avoid duplicated IDs.
function getSlideHeading(
  heading: Element,
  isContinuation: boolean,
  counter: string | undefined
): Element {
  const { id: _id, ...properties } = heading.properties;

  return {
    ...heading,
    properties: isContinuation ? properties : heading.properties,
    children: counter
      ? [...heading.children, createElement("span", CounterClassName, counter)]
      : heading.children,
  };
}

function getOutline(stacks: Slide[][]): OutlineEntry[] {
  return stacks
    .flat()
    .flatMap((slide, index) =>
      slide.anchor && slide.outline
        ? [{ anchor: slide.anchor, slide: index + 1, ...slide.outline }]
        : []
    );
}

function extractNotes(nodes: ElementContent[]): {
  content: ElementContent[];
  notes: ElementContent[];
} {
  const notes: ElementContent[] = [];
  const content = nodes.filter((node) => {
    if (node.type !== "element" || !isNotes(node)) return true;

    notes.push(...node.children);
    return false;
  });

  for (const node of content) {
    visit(node, "element", (child, index, parent) => {
      if (!isNotes(child) || !parent || index === undefined) return;

      notes.push(...child.children);
      parent.children.splice(index, 1);

      return index;
    });
  }

  return { content, notes };
}

function getNotesHtml(notes: ElementContent[]): string | undefined {
  return notes.length > 0 ? toHtml(notes) : undefined;
}

function getDirective(node: ElementContent): Directive | undefined {
  if (node.type !== "comment") return undefined;

  return directivePattern.exec(node.value)?.[1] as Directive | undefined;
}

function getHeading(node: ElementContent): Element | undefined {
  if (node.type !== "element") return undefined;
  if (getHeadingRank(node) !== undefined) return node;
  if (!hasClassName(node, HeadingWrapperClassName)) return undefined;

  return node.children.find(
    (child): child is Element =>
      child.type === "element" && getHeadingRank(child) !== undefined
  );
}

function unwrapKeep(node: ElementContent): ElementContent[] {
  return node.type === "element" && isKeep(node) ? node.children : [node];
}

export interface SlideDeck {
  /**
   * Horizontal stacks of slides, each stack containing a slide and the vertical slides of its nested sections.
   */
  stacks: Slide[][];
  /**
   * The headings of the page with the number of the slide they start on.
   */
  outline: OutlineEntry[];
}

export interface Slide {
  /**
   * The ID of the heading of the section this slide belongs to, used to link docs anchors to slides.
   */
  anchor: string | undefined;
  /**
   * The page title and the headings of the parent sections of the section this slide belongs to.
   */
  breadcrumbs: string[];
  html: string;
  notes: string | undefined;
  outline: Omit<OutlineEntry, "anchor" | "slide"> | undefined;
  type: "title" | "content" | "divider";
}

export interface OutlineEntry {
  anchor: string;
  rank: number;
  slide: number;
  title: string;
}

interface SlidesOptions {
  description: string | undefined;
  splitHeadingLevel: number;
  title: string;
}

interface Section {
  blocks: ElementContent[];
  breadcrumbs: string[];
  heading: Element | undefined;
  rank: number | undefined;
  isContinuation: boolean;
}

interface SectionGroup {
  sections: Section[];
  isVertical: boolean;
}

interface SlidePart {
  section: Section;
  nodes: ElementContent[];
  isContinuation: boolean;
}

type Directive =
  "break" | "hide start" | "hide end" | "keep start" | "keep end";
