import type { StarlightPlugin } from "@astrojs/starlight/types";

import {
  type StarlightViewModesConfig,
  validateConfig,
  type StarlightViewModesUserConfig,
} from "./libs/config";
import { vitePluginStarlightViewModesConfig } from "./libs/vite";
import { overrideStarlightComponent } from "./libs/starlight";

export type { StarlightViewModesConfig, StarlightViewModesUserConfig };

export default function starlightViewModes(
  userConfig?: StarlightViewModesUserConfig
): StarlightPlugin {
  const config = validateConfig(userConfig);

  return {
    name: "starlight-view-modes",
    hooks: {
      "config:setup"({
        addIntegration,
        addRouteMiddleware,
        config: starlightConfig,
        logger,
        updateConfig,
      }) {
        addRouteMiddleware({
          entrypoint: "starlight-view-modes/middleware",
        });

        updateConfig({
          components: {
            ...starlightConfig.components,
            ...overrideStarlightComponent(
              starlightConfig.components,
              logger,
              "PageTitle",
              "PageTitle"
            ),
            ...overrideStarlightComponent(
              starlightConfig.components,
              logger,
              "SocialIcons",
              "SocialIcons"
            ),
            ...overrideStarlightComponent(
              starlightConfig.components,
              logger,
              "TableOfContents",
              "TableOfContents"
            ),
          },
        });

        addIntegration({
          name: "starlight-view-modes-integration",
          hooks: {
            "astro:config:setup": ({ injectRoute, updateConfig }) => {
              updateConfig({
                vite: {
                  plugins: [vitePluginStarlightViewModesConfig(config)],
                },
                // markdown: {
                //   rehypePlugins: [rehypePrefixInternalLinks],
                // },
              });

              if (config.zenModeSettings.enabled) {
                injectRoute({
                  entrypoint: `starlight-view-modes/routes/ZenMode.astro`,
                  pattern: "/zen-mode/[...path]",
                  prerender: true,
                });
              }
            },
          },
        });
      },
    },
  };
}
