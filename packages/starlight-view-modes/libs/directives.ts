const directives = [
  "break",
  "hide start",
  "hide end",
  "keep start",
  "keep end",
  "pause",
] as const;

const directivePattern = new RegExp(
  `^\\s*presentation:\\s*(${directives.join("|")})\\s*$`
);
const mdxCommentPattern = /^\s*\/\*([\s\S]*)\*\/\s*$/;

// Presentation directives are HTML comments in Markdown and MDX comments in MDX, e.g. `<!-- presentation: break -->`
// or `{/* presentation: break */}`.
export function getDirective(comment: string): Directive | undefined {
  return directivePattern.exec(comment)?.[1] as Directive | undefined;
}

export function getMdxDirective(expression: string): Directive | undefined {
  const comment = mdxCommentPattern.exec(expression)?.[1];

  return comment === undefined ? undefined : getDirective(comment);
}

// MDX does not render comments, so directives are rendered as hidden paragraphs containing an HTML comment.
export function getDirectiveHtml(directive: Directive): string {
  return `<p hidden><!-- presentation: ${directive} --></p>`;
}

export type Directive = (typeof directives)[number];
