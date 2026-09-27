import "mdast-util-mdx-expression";

import type { RemarkPlugin } from "@astrojs/markdown-remark";
import { visit } from "unist-util-visit";

import { getDirectiveHtml, getMdxDirective } from "./directives";

export const remarkStarlightViewModes: RemarkPlugin = function () {
  return function (tree) {
    visit(tree, "mdxFlowExpression", (node, index, parent) => {
      const directive = getMdxDirective(node.value);
      if (!directive || !parent || index === undefined) return;

      parent.children[index] = { type: "html", value: getDirectiveHtml(directive) };
    });
  };
};
