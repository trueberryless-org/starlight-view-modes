import type { Content, Element, Root, Text } from "hast";
import { h } from "hastscript";
import type { Plugin } from "unified";

type Section = Element;
const maxWordsPerSlide = 100; // Tune this for desired slide "weight"

export const rehypeRevealSections: Plugin<[], Root> = () => {
  return (tree) => {
    const topLevelSections: Section[] = [];

    let currentHorizontal: Section | null = null;
    let currentVertical: Section | null = null;
    let wordCount = 0;

    const flushVertical = () => {
      if (currentVertical) {
        if (!currentHorizontal) currentHorizontal = createSection();
        currentHorizontal.children!.push(currentVertical);
        currentVertical = null;
        wordCount = 0;
      }
    };

    const flushHorizontal = () => {
      flushVertical();
      if (currentHorizontal) {
        topLevelSections.push(currentHorizontal);
        currentHorizontal = null;
      }
    };

    const ensureVertical = () => {
      if (!currentVertical) {
        currentVertical = createSection();
      }
      if (!currentHorizontal) {
        currentHorizontal = createSection();
      }
    };

    const pushContent = (node: Content) => {
      const nodeWords = countWords(node);

      // Flush if limit exceeded
      if (wordCount + nodeWords > maxWordsPerSlide) {
        flushVertical();
      }

      ensureVertical();
      currentVertical!.children!.push(node);
      wordCount += nodeWords;
    };

    for (const node of tree.children) {
      if (isHeading(node, 1) || isHeading(node, 2)) {
        flushHorizontal();
        currentHorizontal = createSection([node]);
      } else {
        pushContent(node);
      }
    }

    flushHorizontal();
    tree.children = topLevelSections;
  };
};

function isHeading(node: Content, level: number): node is Element {
  if (node.type !== "element") return false;

  const tagMatch = node.tagName === `h${level}`;
  const classList = node.properties?.className as string[] | undefined;

  const classMatch =
    node.tagName === "div" &&
    !!classList &&
    classList?.includes("sl-heading-wrapper") &&
    classList.includes(`level-h${level}`);

  return tagMatch || classMatch;
}

function createSection(children: Content[] = []): Section {
  return h("section", {}, children) as Section;
}

// Count words in text nodes recursively
function countWords(node: Content): number {
  if (node.type === "text") {
    return node.value.trim().split(/\s+/).length;
  }
  if (node.type === "element" && node.children) {
    return node.children.reduce((sum, child) => sum + countWords(child), 0);
  }
  return 0;
}
