import type { Element, ElementContent } from "hast";

import type { PresentationAnimation } from "./config";
import { getHeadingRank, isElement } from "./hast";
import { getBlockLines } from "./slideLayout";

// Content is animated using reveal.js fragments, see https://revealjs.com/fragments/
const FragmentClassName = "fragment";
const fragmentStyles: Record<PresentationAnimation, string | undefined> = {
  fade: undefined,
  "slide-up": "fade-up",
  "slide-down": "fade-down",
  "slide-left": "fade-left",
  "slide-right": "fade-right",
  grow: "zoom-in",
};

// Animates the blocks of a slide one after the other, e.g. paragraphs or code blocks, and the items of lists one by one.
// Headings are displayed with the block following them.
export function animateSlideContent(
  nodes: ElementContent[],
  animation: PresentationAnimation
): ElementContent[] {
  let index = 0;

  // Headings share the fragment index of the following block.
  const animate = (node: Element): Element => {
    const animated = getAnimatedElement(node, animation, index);
    if (getHeadingRank(node) === undefined) index++;

    return animated;
  };

  return nodes.map((node) => {
    if (node.type !== "element" || getBlockLines(node) === 0) return node;
    if (!isList(node)) return animate(node);

    // List items are animated one by one, and a heading introducing a list is displayed with its first item.
    return {
      ...node,
      children: node.children.map((child) =>
        child.type === "element" && isElement(child, "li")
          ? animate(child)
          : child
      ),
    };
  });
}

function getAnimatedElement(
  node: Element,
  animation: PresentationAnimation,
  index: number
): Element {
  const className = node.properties["className"];
  const classNames = Array.isArray(className) ? className : [];
  const style = fragmentStyles[animation];

  return {
    ...node,
    properties: {
      ...node.properties,
      className: [...classNames, FragmentClassName, ...(style ? [style] : [])],
      dataFragmentIndex: index,
    },
  };
}

function isList(node: Element): boolean {
  return node.tagName === "ul" || node.tagName === "ol";
}
