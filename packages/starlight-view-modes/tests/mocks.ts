import { vi } from "vitest";

import type { StarlightViewModesContext } from "../libs/vite";

const defaultContext: StarlightViewModesContext = {
  base: "",
  trailingSlash: "ignore",
  defaultLocale: undefined,
  locales: [],
  pagefind: true,
};

let context = defaultContext;

export function mockStarlightConfig(config: {
  defaultLocale: { locale?: string; lang?: string };
  locales?: Record<string, unknown>;
}) {
  mockContext({
    defaultLocale: config.defaultLocale.locale,
    locales: Object.keys(config.locales ?? {}),
  });
}

export function mockAstroConfigBase(
  base = "",
  trailingSlash: StarlightViewModesContext["trailingSlash"] = "ignore"
) {
  mockContext({ base, trailingSlash });
}

export function mockConfig() {
  vi.doMock("virtual:starlight-view-modes/config", () => ({
    default: {
      zenModeSettings: {
        exclude: [],
        keyboardShortcut: [],
      },
      presentationModeSettings: {
        exclude: [],
        keyboardShortcut: [],
      },
    },
  }));
}

export function resetMocks() {
  context = defaultContext;
  vi.resetModules();
  vi.resetAllMocks();
}

function mockContext(update: Partial<StarlightViewModesContext>) {
  context = { ...context, ...update };
  vi.doMock("virtual:starlight-view-modes/context", () => ({
    default: context,
  }));
}
