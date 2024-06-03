import type { AstroIntegration } from "astro";

import type { StarlightZenModeConfig } from "..";
import { vitePluginStarlightZenModeConfig } from "./vite";

export function starlightZenModeIntegration(config: StarlightZenModeConfig): AstroIntegration {
    return {
        name: "starlight-zen-mode-integration",
        hooks: {
            "astro:config:setup": ({ updateConfig }) => {
                updateConfig({
                    // markdown: {
                    //     rehypePlugins: [rehypeMetaString, rehypeRaw, rehypeStarlightZenMode],
                    // },
                    vite: {
                        plugins: [vitePluginStarlightZenModeConfig(config)],
                    },
                });
            },
        },
    };
}
