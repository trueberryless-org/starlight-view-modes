import type { ViteUserConfig } from "astro";

import type { StarlightZenModeConfig } from "..";

export function vitePluginStarlightZenModeConfig(config: StarlightZenModeConfig): VitePlugin {
    const moduleId = "virtual:starlight-zen-mode-config";
    const resolvedModuleId = `\0${moduleId}`;
    const moduleContent = `export default ${JSON.stringify(config)}`;

    return {
        name: "vite-plugin-starlight-zen-mode-config",
        load(id) {
            return id === resolvedModuleId ? moduleContent : undefined;
        },
        resolveId(id) {
            return id === moduleId ? resolvedModuleId : undefined;
        },
    };
}

type VitePlugin = NonNullable<ViteUserConfig["plugins"]>[number];
