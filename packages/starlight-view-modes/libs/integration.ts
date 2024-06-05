import type { AstroIntegration } from "astro";

import type { StarlightViewModesConfig } from "..";
import { vitePluginStarlightViewModesConfig } from "./vite";

export function starlightViewModesIntegration(config: StarlightViewModesConfig): AstroIntegration {
    return {
        name: "starlight-view-modes-integration",
        hooks: {
            "astro:config:setup": ({ updateConfig }) => {
                updateConfig({
                    vite: {
                        plugins: [vitePluginStarlightViewModesConfig(config)],
                    },
                });
            },
        },
    };
}
