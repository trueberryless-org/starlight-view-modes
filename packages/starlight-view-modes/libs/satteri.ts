import { defineMdastPlugin } from "satteri";

import { getDirectiveHtml, getMdxDirective } from "./directives";

export function satteriStarlightViewModes() {
  return defineMdastPlugin({
    name: "starlight-view-modes",
    mdxFlowExpression(node, ctx) {
      const directive = getMdxDirective(node.value);
      if (!directive) return;

      ctx.replaceNode(node, { type: "html", value: getDirectiveHtml(directive) });
    },
  });
}
