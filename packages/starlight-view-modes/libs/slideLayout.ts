import type { Element, ElementContent } from "hast";
import { visit } from "unist-util-visit";

import {
  getHeadingRank,
  getText,
  hasClassName,
  hasDescendant,
  isElement,
  isNotes,
  resourceTagNames,
} from "./hast";

// Slide sizes are estimated in lines of body text rendered on a 1280×720 slide.
const MaxSlideLines = 13;
const HeadingLines = 2;
const BreadcrumbsLines = 0.75;
const InlineHeadingLines = 1.5;
const MediaLines = 8;
const CharactersPerLine = 74;
const ListCharactersPerLine = 70;
const CodeLineRatio = 0.9;
// Sticky blocks can overflow a slide by this ratio as overflowing slides are shrunk to fit.
const StickyOverflowRatio = 1.25;
const BalancePrecision = 0.25;

const CodeLineClassName = "ec-line";
export const KeepClassName = "starlight-view-modes-presentation-keep";

const mediaTagNames = new Set([
  "audio",
  "canvas",
  "iframe",
  "img",
  "picture",
  "video",
]);
const boxedTagNames = new Set(["aside", "blockquote", "details"]);
const blockTagNames = new Set([
  ...boxedTagNames,
  "div",
  "dl",
  "figure",
  "ol",
  "p",
  "pre",
  "table",
  "ul",
]);

export function getSlideCapacity(
  hasHeading: boolean,
  hasBreadcrumbs: boolean
): number {
  return (
    MaxSlideLines -
    (hasHeading ? HeadingLines : 0) -
    (hasBreadcrumbs ? BreadcrumbsLines : 0)
  );
}

// Distributes blocks on as few slides as possible while keeping slides as evenly filled as possible.
export function layoutBlocks(
  blocks: ElementContent[],
  capacity: number
): ElementContent[][] {
  const items = joinStickyItems(
    blocks
      .flatMap((block) => splitBlock(block, capacity))
      .map((block) => ({ nodes: [block], lines: getBlockLines(block) })),
    capacity
  );

  return partitionItems(items, capacity).map((group) =>
    group.flatMap((item) => item.nodes)
  );
}

export function getLines(nodes: ElementContent[]): number {
  return nodes.reduce((lines, node) => lines + getBlockLines(node), 0);
}

export function getBlockLines(node: ElementContent): number {
  if (node.type === "text") return getTextLines(node.value);
  if (node.type !== "element") return 0;
  if (resourceTagNames.has(node.tagName) || isNotes(node)) return 0;
  if (isKeep(node)) return getLines(node.children);
  if (isCodeBlock(node)) return getCodeLines(node);
  if (isList(node)) return getListLines(node);
  if (node.tagName === "table") return getTableLines(node);
  if (getHeadingRank(node) !== undefined) return InlineHeadingLines;

  const textLines = getTextLines(getText(node));

  if (hasDescendant(node, (child) => mediaTagNames.has(child.tagName))) {
    return Math.max(MediaLines, textLines);
  }
  if (
    boxedTagNames.has(node.tagName) ||
    hasClassName(node, "starlight-aside")
  ) {
    return textLines + 2;
  }

  return textLines + 0.5;
}

export function isKeep(node: Element): boolean {
  return hasClassName(node, KeepClassName);
}

// Keeps headings and paragraphs introducing the next block (e.g. "Run the following command:") on the
// same slide as the block they introduce, even if the slide overflows the estimated capacity.
// Nodes without size, e.g. whitespace, scripts or speaker notes, stay with the preceding block.
function joinStickyItems(items: Item[], capacity: number): Item[] {
  const joined: Item[] = [];

  for (const item of items) {
    const previous = joined.at(-1);

    if (
      previous &&
      (item.lines === 0 ||
        (isSticky(getLastBlock(previous.nodes)) &&
          previous.lines + item.lines <= capacity * StickyOverflowRatio))
    ) {
      previous.nodes.push(...item.nodes);
      previous.lines += item.lines;
    } else {
      joined.push({ nodes: [...item.nodes], lines: item.lines });
    }
  }

  return joined;
}

// Splits items into the minimum number of slides while keeping slides as evenly filled as possible.
function partitionItems(items: Item[], capacity: number): Item[][] {
  const count = packItems(items, capacity).length;
  let low = Math.max(0, ...items.map((item) => item.lines));
  let high = Math.max(capacity, low);

  while (high - low > BalancePrecision) {
    const middle = (low + high) / 2;

    if (packItems(items, middle).length <= count) {
      high = middle;
    } else {
      low = middle;
    }
  }

  return packItems(items, high);
}

function packItems(items: Item[], capacity: number): Item[][] {
  const groups: Item[][] = [];
  let group: Item[] = [];
  let lines = 0;

  for (const item of items) {
    if (lines > 0 && lines + item.lines > capacity) {
      groups.push(group);
      group = [];
      lines = 0;
    }

    group.push(item);
    lines += item.lines;
  }

  groups.push(group);

  return groups;
}

function splitBlock(block: ElementContent, capacity: number): ElementContent[] {
  if (
    block.type !== "element" ||
    !isList(block) ||
    getBlockLines(block) <= capacity
  ) {
    return [block];
  }

  const items = block.children
    .filter((child) => isElement(child, "li"))
    .map((item) => ({ nodes: [item], lines: getListItemLines(item) }));
  const start = Number(block.properties["start"] ?? 1);
  let offset = 0;

  return partitionItems(items, capacity - 0.5).map((group) => {
    const list: Element = {
      ...block,
      properties:
        block.tagName === "ol" && offset > 0
          ? getOrderedListProperties(block, start + offset)
          : block.properties,
      children: group.flatMap((item) => item.nodes),
    };

    offset += group.length;

    return list;
  });
}

// Starlight `<Steps>` use a CSS counter starting at `--sl-steps-start` instead of the `start` attribute.
function getOrderedListProperties(
  list: Element,
  start: number
): Element["properties"] {
  const style = list.properties["style"];

  return {
    ...list.properties,
    start,
    style: `${typeof style === "string" ? `${style};` : ""}--sl-steps-start: ${start - 1}`,
  };
}

function getLastBlock(nodes: ElementContent[]): ElementContent | undefined {
  return nodes.findLast((node) => getBlockLines(node) > 0);
}

function getCodeLines(node: Element): number {
  let lines = 0;

  visit(node, "element", (child) => {
    if (hasClassName(child, CodeLineClassName)) lines++;
  });

  if (lines === 0) {
    lines = getText(node).trimEnd().split("\n").length;
  }

  return lines * CodeLineRatio + 1.5;
}

function getListLines(node: Element): number {
  return node.children.reduce(
    (lines, child) =>
      isElement(child, "li") ? lines + getListItemLines(child) : lines,
    0.5
  );
}

function getListItemLines(node: Element): number {
  let lines = 0.25;
  let text = "";

  for (const child of node.children) {
    if (isBlock(child)) {
      lines += getBlockLines(child);
    } else {
      text += getText(child);
    }
  }

  return lines + getTextLines(text, ListCharactersPerLine);
}

function getTableLines(node: Element): number {
  let rows = 0;

  visit(node, "element", (child) => {
    if (child.tagName === "tr") rows++;
  });

  return rows * 1.35 + 0.5;
}

function getTextLines(text: string, charactersPerLine = CharactersPerLine) {
  const length = text.replace(/\s+/g, " ").trim().length;

  return Math.ceil(length / charactersPerLine);
}

function isSticky(node: ElementContent | undefined): boolean {
  if (node?.type !== "element") return false;
  if (getHeadingRank(node) !== undefined) return true;

  return isElement(node, "p") && getText(node).trim().endsWith(":");
}

// Custom elements, e.g. `<starlight-tabs>`, are considered blocks.
function isBlock(node: ElementContent): node is Element {
  return (
    node.type === "element" &&
    (blockTagNames.has(node.tagName) ||
      node.tagName.includes("-") ||
      getHeadingRank(node) !== undefined)
  );
}

function isCodeBlock(node: Element): boolean {
  return (
    node.tagName === "pre" ||
    hasDescendant(node, (child) => child.tagName === "pre")
  );
}

function isList(node: Element): boolean {
  return node.tagName === "ul" || node.tagName === "ol";
}

interface Item {
  nodes: ElementContent[];
  lines: number;
}
