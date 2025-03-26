/// <reference path="./locals.d.ts" />
import type { StarlightPlugin } from "@astrojs/starlight/types";

import {
  type StarlightViewModesConfig,
  type StarlightViewModesUserConfig,
  validateConfig,
} from "./libs/config";
import { overrideStarlightComponent } from "./libs/starlight";
import { vitePluginStarlightViewModesConfig } from "./libs/vite";

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
        astroConfig,
        logger,
        updateConfig,
      }) {
        addRouteMiddleware({
          entrypoint: "starlight-view-modes/middleware",
          order: "pre",
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
              "Search" /* Override because should stay in zen-mode for all search results */,
              "Search"
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
                  plugins: [
                    vitePluginStarlightViewModesConfig(config, {
                      base: astroConfig.base,
                      trailingSlash: astroConfig.trailingSlash,
                    }),
                  ],
                },
                // markdown: {
                //   rehypePlugins: [rehypePrefixInternalLinks],
                // },
              });

              if (config.zenModeSettings.enabled) {
                injectRoute({
                  entrypoint: `starlight-view-modes/routes/ZenMode.astro`,
                  pattern: "[...lang]/zen-mode/[...path]",
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
