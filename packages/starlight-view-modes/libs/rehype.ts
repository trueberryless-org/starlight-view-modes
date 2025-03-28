import isAbsoluteUrl from "is-absolute-url";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import { getCurrentModeFromPath, insertModePathname } from "./utils";

export function rehypePrefixInternalLinks() {
  /**
   * @param {Root} tree
   */
  return function (tree: any) {
    visit(tree, "element", function (node) {
      if (
        node.tagName === "a" &&
        node.properties &&
        typeof node.properties.href === "string"
      ) {
        // Check if 'view-modes-ignore' is set
        if ("view-modes-ignore" in node.properties) {
          return;
        }

        const href = node.properties.href;
        if (!isAbsoluteUrl(href) && !href.startsWith("#")) {
          node.properties.href = insertModePathname(href, "zen-mode");
        }
      }
    });
  };
}

export const processedHtml = async (
  contentHtml: string,
  ...rehypeFunctions: any[]
) => {
  let processor = unified().use(rehypeParse, { fragment: true });

  // Apply all the rehype functions in the order they are passed
  for (const rehypeFunction of rehypeFunctions) {
    processor = processor.use(rehypeFunction);
  }

  // Add the final stringify step
  const finalProcessor = processor.use(rehypeStringify);

  const processedHtml = await finalProcessor.process(contentHtml);

  return processedHtml.toString();
};
