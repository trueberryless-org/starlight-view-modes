import type { Element, ElementContent, RootContent } from "hast";
import { visit } from "unist-util-visit";

const headingPattern = /^h([1-6])$/;

export const NotesClassName = "starlight-view-modes-notes";

export const resourceTagNames = new Set([
  "link",
  "meta",
  "noscript",
  "script",
  "style",
  "template",
]);

export function getText(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type !== "element") return "";
  if (resourceTagNames.has(node.tagName) || isNotes(node)) return "";

  return node.children.map(getText).join("");
}

export function getHeadingRank(node: Element): number | undefined {
  const rank = headingPattern.exec(node.tagName)?.[1];

  return rank ? Number(rank) : undefined;
}

export function getId(node: Element | undefined): string | undefined {
  const id = node?.properties["id"];

  return typeof id === "string" ? id : undefined;
}

export function createElement(
  tagName: string,
  className: string | undefined,
  children: ElementContent[] | string
): Element {
  return {
    type: "element",
    tagName,
    properties: className ? { className: [className] } : {},
    children:
      typeof children === "string"
        ? [{ type: "text", value: children }]
        : children,
  };
}

export function isElementContent(node: RootContent): node is ElementContent {
  return (
    node.type === "element" || node.type === "text" || node.type === "comment"
  );
}

export function isElement(
  node: ElementContent | undefined,
  tagName: string
): node is Element {
  return node?.type === "element" && node.tagName === tagName;
}

export function isNotes(node: Element): boolean {
  return hasClassName(node, NotesClassName);
}

export function hasClassName(node: Element, className: string): boolean {
  const classNames = node.properties["className"];

  return Array.isArray(classNames) && classNames.includes(className);
}

export function hasDescendant(
  node: Element,
  predicate: (child: Element) => boolean
): boolean {
  let found = false;

  visit(node, "element", (child) => {
    if (child === node || !predicate(child)) return;

    found = true;
    return false;
  });

  return found;
}
