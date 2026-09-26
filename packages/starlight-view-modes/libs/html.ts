import type { Element } from "hast";
import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import { visit } from "unist-util-visit";

import { isAbsoluteUrl } from "./path";
import { insertModePathname } from "./utils";

const IgnoreAttribute = "view-modes-ignore";

export function prefixInternalLinks(html: string, mode: string): string {
  const tree = fromHtml(html, { fragment: true });

  visit(tree, "element", (node) => {
    if (isPrefixableLink(node)) {
      node.properties["href"] = insertModePathname(
        node.properties["href"],
        mode
      );
    }
  });

  return toHtml(tree);
}

function isPrefixableLink(
  node: Element
): node is Element & { properties: { href: string } } {
  const href = node.properties["href"];

  return (
    node.tagName === "a" &&
    typeof href === "string" &&
    !(IgnoreAttribute in node.properties) &&
    !isAbsoluteUrl(href) &&
    !href.startsWith("#")
  );
}
