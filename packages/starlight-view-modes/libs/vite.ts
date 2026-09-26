import type { StarlightUserConfig } from "@astrojs/starlight/types";
import type { AstroConfig, ViteUserConfig } from "astro";

import type { StarlightViewModesConfig } from "./config";

const RootLocale = "root";

export function vitePluginStarlightViewModes(
  config: StarlightViewModesConfig,
  starlightConfig: Pick<
    StarlightUserConfig,
    "defaultLocale" | "locales" | "pagefind" | "prerender"
  >,
  astroConfig: Pick<AstroConfig, "base" | "trailingSlash">
): VitePlugin {
  const context = getContext(starlightConfig, astroConfig);

  const modules = {
    "virtual:starlight-view-modes/config": `export default ${JSON.stringify(config)};`,
    "virtual:starlight-view-modes/context": `export default ${JSON.stringify(context)};`,
  };

  const moduleResolutionMap = Object.fromEntries(
    (Object.keys(modules) as (keyof typeof modules)[]).map((key) => [
      resolveVirtualModuleId(key),
      key,
    ])
  );

  return {
    name: "vite-plugin-starlight-view-modes",
    load(id) {
      const moduleId = moduleResolutionMap[id];
      return moduleId ? modules[moduleId] : undefined;
    },
    resolveId(id) {
      return Object.hasOwn(modules, id)
        ? resolveVirtualModuleId(id)
        : undefined;
    },
  };
}

export function getContext(
  starlightConfig: Parameters<typeof vitePluginStarlightViewModes>[1],
  astroConfig: Parameters<typeof vitePluginStarlightViewModes>[2]
): StarlightViewModesContext {
  const isMultilingual = isMultilingualConfig(starlightConfig.locales);

  return {
    base: astroConfig.base,
    trailingSlash: astroConfig.trailingSlash,
    defaultLocale: isMultilingual ? starlightConfig.defaultLocale : undefined,
    locales: isMultilingual ? Object.keys(starlightConfig.locales ?? {}) : [],
    pagefind: isPagefindEnabled(starlightConfig),
  };
}

function isPagefindEnabled(
  starlightConfig: Parameters<typeof vitePluginStarlightViewModes>[1]
): boolean {
  if (starlightConfig.pagefind === undefined) {
    return starlightConfig.prerender !== false;
  }

  return starlightConfig.pagefind !== false;
}

function isMultilingualConfig(
  locales: StarlightUserConfig["locales"]
): boolean {
  const configuredLocales = Object.keys(locales ?? {});

  return (
    configuredLocales.length > 1 ||
    (configuredLocales.length === 1 && locales?.[RootLocale] === undefined)
  );
}

function resolveVirtualModuleId<TModuleId extends string>(
  id: TModuleId
): `\0${TModuleId}` {
  return `\0${id}`;
}

export interface StarlightViewModesContext {
  base: AstroConfig["base"];
  trailingSlash: AstroConfig["trailingSlash"];
  defaultLocale: string | undefined;
  locales: string[];
  pagefind: boolean;
}

type VitePlugin = NonNullable<ViteUserConfig["plugins"]>[number];
