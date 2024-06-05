import type { ViteUserConfig } from "astro";

import type { StarlightViewModesConfig } from "..";

export function vitePluginStarlightViewModesConfig(config: StarlightViewModesConfig): VitePlugin {
    const moduleId = "virtual:starlight-view-modes-config";
    const resolvedModuleId = `\0${moduleId}`;
    const moduleContent = `export default ${JSON.stringify(config)}`;

    return {
        name: "vite-plugin-starlight-view-modes-config",
        load(id) {
            return id === resolvedModuleId ? moduleContent : undefined;
        },
        resolveId(id) {
            return id === moduleId ? resolvedModuleId : undefined;
        },
    };
}

type VitePlugin = NonNullable<ViteUserConfig["plugins"]>[number];
