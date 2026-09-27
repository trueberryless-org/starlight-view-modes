import type { AstroConfig, AstroIntegrationLogger } from "astro";

import { remarkStarlightViewModes } from "./remark";
import { satteriStarlightViewModes } from "./satteri";

// Presentation directives written as MDX comments are only supported with the built-in Markdown processors. As
// Presentation Mode is enabled by default, other processors only disable them instead of failing the build.
export function applyMarkdownPlugin(
  processor: MarkdownProcessor,
  logger: AstroIntegrationLogger
): void {
  if (isSatteriProcessor(processor)) {
    processor.options.mdastPlugins.push(satteriStarlightViewModes());
  } else if (isUnifiedProcessor(processor)) {
    processor.options.remarkPlugins.push([remarkStarlightViewModes]);
  } else {
    logger.warn(
      "The configured `markdown.processor` is not supported by Presentation Mode, so presentation directives written as MDX comments are ignored. Use the default Markdown processor or the `unified()` processor to use them."
    );
  }
}

function isSatteriProcessor(
  processor: unknown
): processor is SatteriMarkdownProcessor {
  if (typeof processor !== "object" || processor === null) return false;

  const candidate = processor as {
    name?: unknown;
    options?: { mdastPlugins?: unknown };
  };

  return (
    candidate.name === "satteri" &&
    Array.isArray(candidate.options?.mdastPlugins)
  );
}

function isUnifiedProcessor(
  processor: unknown
): processor is UnifiedMarkdownProcessor {
  if (typeof processor !== "object" || processor === null) return false;

  const candidate = processor as {
    name?: unknown;
    options?: { remarkPlugins?: unknown };
  };

  return (
    candidate.name === "unified" &&
    Array.isArray(candidate.options?.remarkPlugins)
  );
}

type MarkdownProcessor = NonNullable<AstroConfig["markdown"]["processor"]>;

interface SatteriMarkdownProcessor {
  name: "satteri";
  options: { mdastPlugins: unknown[] };
}

interface UnifiedMarkdownProcessor {
  name: "unified";
  options: { remarkPlugins: unknown[] };
}
