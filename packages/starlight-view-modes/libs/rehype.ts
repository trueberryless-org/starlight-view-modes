import { visit } from "unist-util-visit";
import isAbsoluteUrl from "is-absolute-url";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";

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
        const href = node.properties.href;
        // Check if the link is internal
        if (!isAbsoluteUrl(href)) {
          // Prefix the internal link with '/mode'
          node.properties.href = `/zen-mode` + href;
        }
      }
    });
  };
}

export const processedHtml = async (
  contentHtml: string,
  rehypeFunction: any
) => {
  const processedHtml = await unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeFunction)
    .use(rehypeStringify)
    .process(contentHtml);

  return processedHtml.toString();
};
