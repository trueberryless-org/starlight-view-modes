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
const MaxSlideLines = 12.5;
const HeadingLines = 2;
const InlineHeadingLines = 1.5;
const MediaLines = 8;
const CharactersPerLine = 74;
const ListCharactersPerLine = 70;
const CodeLineRatio = 0.9;
const TableRowLines = 1.35;
// Sticky blocks can overflow a slide by this ratio as overflowing slides are shrunk to fit.
const StickyOverflowRatio = 1.25;

// Costs used to find the best way to split content into slides, see `getSlideCost()`.
const SlideCost = 1;
const MinSlideFill = 0.4;
// Estimated slide sizes are slightly conservative so sparse slides are detected using a higher fill ratio.
const SparseSlideFill = 0.5;
const UnderfillCost = 8;
const ShrinkCost = 10;
const MaxComfortableShrink = 0.3;
const ExcessiveShrinkCost = 40;
const BalanceCost = 0.5;
const DetailBreakCost = 0.4;
// Slides longer than this ratio of their capacity are not considered when splitting content.
const MaxSlideRatio = 3;

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

export function getSlideCapacity(hasHeading: boolean): number {
  return MaxSlideLines - (hasHeading ? HeadingLines : 0);
}

// Splits blocks into slides. Content following a heading of a nested section (e.g. `h4` in an `h3` section) is
// considered as details of the section, preferably starting a new slide at such a heading.
export function layoutBlocks(
  blocks: ElementContent[],
  { hasHeading, isDetail, startsSection }: LayoutOptions
): LayoutSlide[] {
  const capacity = getSlideCapacity(hasHeading);
  const items = getLayoutItems(
    joinStickyItems(
      blocks
        .flatMap((block) => splitBlock(block, capacity))
        .map((block) => ({ nodes: [block], lines: getBlockLines(block) })),
      capacity
    ),
    isDetail
  );

  // The first slide of a section always displays the section heading while detail slides do not repeat it.
  const isDetailSlide = (item: LayoutItem | undefined, isFirst: boolean) =>
    !(isFirst && startsSection) && (item?.isDetail ?? false);

  const getCapacity = (item: LayoutItem | undefined, isFirst: boolean) =>
    isDetailSlide(item, isFirst) ? getSlideCapacity(false) : capacity;

  return partitionItems(items, getCapacity).map((group, index) => ({
    nodes: group.flatMap((item) => item.nodes),
    isDetail: isDetailSlide(group[0], index === 0),
    isSparse:
      getLines(group.flatMap((item) => item.nodes)) /
        getCapacity(group[0], index === 0) <
      SparseSlideFill,
  }));
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

function getLayoutItems(items: Item[], isDetail: boolean): LayoutItem[] {
  let isCurrentDetail = isDetail;

  return items.map((item) => {
    const startsWithHeading = isHeading(getFirstBlock(item.nodes));
    isCurrentDetail ||= startsWithHeading;

    return { ...item, isDetail: isCurrentDetail, startsWithHeading };
  });
}

// Finds the split of items into slides with the lowest total cost, see `getSlideCost()`.
function partitionItems<TItem extends Item>(
  items: TItem[],
  getCapacity: (firstItem: TItem, isFirst: boolean) => number
): TItem[][] {
  const costs = [0];
  const starts = [0];

  for (let end = 1; end <= items.length; end++) {
    let bestCost = Infinity;
    let bestStart = end - 1;
    let lines = 0;

    for (let start = end - 1; start >= 0; start--) {
      const item = items[start];
      if (!item) break;

      const capacity = getCapacity(item, start === 0);
      lines += item.lines;

      if (start < end - 1 && lines > capacity * MaxSlideRatio) break;

      const cost =
        (costs[start] ?? 0) +
        getSlideCost(lines / capacity) +
        (start > 0 && isDetailBreak(item) ? DetailBreakCost : 0);

      if (cost < bestCost) {
        bestCost = cost;
        bestStart = start;
      }
    }

    costs[end] = bestCost;
    starts[end] = bestStart;
  }

  const groups: TItem[][] = [];

  for (let end = items.length; end > 0; end = starts[end] ?? 0) {
    groups.unshift(items.slice(starts[end] ?? 0, end));
  }

  return groups.length > 0 ? groups : [[]];
}

// The cost of a slide filled at the given ratio of its capacity, favoring fewer slides, penalizing slides filled
// below `MinSlideFill` and slides requiring their content to be shrunk to fit, and favoring evenly filled slides.
function getSlideCost(fill: number): number {
  const shrink = fill > 1 ? 1 - 1 / fill : 0;

  return (
    SlideCost +
    UnderfillCost * Math.max(0, MinSlideFill - fill) +
    ShrinkCost * shrink +
    ExcessiveShrinkCost * Math.max(0, shrink - MaxComfortableShrink) ** 2 +
    BalanceCost * (1 - Math.min(fill, 1)) ** 2
  );
}

// Detail slides should preferably start with the heading of a nested section.
function isDetailBreak(item: LayoutItem | Item): boolean {
  return "isDetail" in item && item.isDetail && !item.startsWithHeading;
}

function splitBlock(block: ElementContent, capacity: number): ElementContent[] {
  if (block.type !== "element" || getBlockLines(block) <= capacity) {
    return [block];
  }

  if (block.tagName === "table") return splitTable(block, capacity);
  if (!isList(block)) return [block];

  const items = block.children
    .filter((child) => isElement(child, "li"))
    .map((item) => ({ nodes: [item], lines: getListItemLines(item) }));
  const start = Number(block.properties["start"] ?? 1);
  let offset = 0;

  return partitionItems(items, () => capacity - 0.5).map((group) => {
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

// Splits a table between its body rows, repeating the table head on each part.
function splitTable(table: Element, capacity: number): ElementContent[] {
  const head = table.children.find((child) => isElement(child, "thead"));
  const body = table.children.find((child) => isElement(child, "tbody"));
  if (!body || body.type !== "element") return [table];

  const rows = body.children
    .filter((child) => isElement(child, "tr"))
    .map((row) => ({ nodes: [row], lines: TableRowLines }));
  const headLines = head ? TableRowLines : 0;

  return partitionItems(rows, () => capacity - headLines - 0.5).map(
    (group) => ({
      ...table,
      children: [
        ...(head ? [head] : []),
        { ...body, children: group.flatMap((row) => row.nodes) },
      ],
    })
  );
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

function getFirstBlock(nodes: ElementContent[]): ElementContent | undefined {
  return nodes.find((node) => getBlockLines(node) > 0);
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

  return rows * TableRowLines + 0.5;
}

function getTextLines(text: string, charactersPerLine = CharactersPerLine) {
  const length = text.replace(/\s+/g, " ").trim().length;

  return Math.ceil(length / charactersPerLine);
}

function isSticky(node: ElementContent | undefined): boolean {
  if (isHeading(node)) return true;

  return isElement(node, "p") && getText(node).trim().endsWith(":");
}

function isHeading(node: ElementContent | undefined): boolean {
  return node?.type === "element" && getHeadingRank(node) !== undefined;
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

interface LayoutItem extends Item {
  isDetail: boolean;
  startsWithHeading: boolean;
}

interface LayoutOptions {
  hasHeading: boolean;
  /**
   * Whether the blocks are part of the details of a section, e.g. after a thematic break following a nested heading.
   */
  isDetail: boolean;
  /**
   * Whether the blocks start a section, e.g. are not following a thematic break.
   */
  startsSection: boolean;
}

export interface LayoutSlide {
  nodes: ElementContent[];
  /**
   * Whether the slide only contains details of a section and should be placed vertically below its section.
   */
  isDetail: boolean;
  /**
   * Whether the slide is sparsely filled, e.g. a short section which cannot be combined with other content.
   */
  isSparse: boolean;
}
