import type { AstroConfig, ViteUserConfig } from "astro";

import type { StarlightViewModesConfig } from "..";

export function vitePluginStarlightViewModesConfig(
  starlightViewModesConfig: StarlightViewModesConfig,
  context: StarlightViewModesContext
): VitePlugin {
  const modules = {
    "virtual:starlight-view-modes-config": `export default ${JSON.stringify(starlightViewModesConfig)}`,
    "virtual:starlight-view-modes-context": `export default ${JSON.stringify(context)}`,
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
      return id in modules ? resolveVirtualModuleId(id) : undefined;
    },
  };
}

function resolveVirtualModuleId<TModuleId extends string>(
  id: TModuleId
): `\0${TModuleId}` {
  return `\0${id}`;
}

// https://github.com/HiDeoo/starlight-blog/blob/3f9e45506b240a6c837e0f601b9cf865ca6473e1/packages/starlight-blog/libs/vite.ts#L36
export interface StarlightViewModesContext {
  base: AstroConfig["base"];
  trailingSlash: AstroConfig["trailingSlash"];
}

type VitePlugin = NonNullable<ViteUserConfig["plugins"]>[number];
