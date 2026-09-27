import type { AstroIntegrationLogger } from "astro";
import { describe, expect, test, vi } from "vitest";

import { applyMarkdownPlugin } from "../libs/processor";

function getLogger() {
  return { warn: vi.fn() } as unknown as AstroIntegrationLogger & { warn: ReturnType<typeof vi.fn> };
}

describe("applyMarkdownPlugin", () => {
  test("adds the plugin to the built-in Markdown processors", () => {
    const logger = getLogger();
    const satteri = { name: "satteri", options: { mdastPlugins: [] as unknown[] } };
    const unified = { name: "unified", options: { remarkPlugins: [] as unknown[] } };

    applyMarkdownPlugin(satteri as never, logger);
    applyMarkdownPlugin(unified as never, logger);

    expect(satteri.options.mdastPlugins).toHaveLength(1);
    expect(unified.options.remarkPlugins).toHaveLength(1);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test("warns instead of failing with other Markdown processors", () => {
    const logger = getLogger();

    expect(() => applyMarkdownPlugin({ name: "custom" } as never, logger)).not.toThrow();
    expect(logger.warn).toHaveBeenCalledOnce();
  });
});
