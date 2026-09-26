/// <reference path="./locals.d.ts" />
import type { StarlightPlugin } from "@astrojs/starlight/types";

import {
  type StarlightViewModesConfig,
  type StarlightViewModesUserConfig,
  validateConfig,
} from "./libs/config";
import { getComponentOverrides } from "./libs/starlight";
import { vitePluginStarlightViewModes } from "./libs/vite";
import { Translations } from "./translations";

export type { StarlightViewModesConfig, StarlightViewModesUserConfig };

export default function starlightViewModes(
  userConfig?: StarlightViewModesUserConfig
): StarlightPlugin {
  const config = validateConfig(userConfig);

  return {
    name: "starlight-view-modes",
    hooks: {
      "i18n:setup"({ injectTranslations }) {
        injectTranslations(Translations);
      },
      "config:setup"({
        addIntegration,
        addRouteMiddleware,
        config: starlightConfig,
        logger,
        updateConfig: updateStarlightConfig,
      }) {
        addRouteMiddleware({
          entrypoint: "starlight-view-modes/middleware",
          order: "pre",
        });

        updateStarlightConfig({
          components: getComponentOverrides(
            starlightConfig.components,
            logger,
            ["PageTitle", "Search", "SocialIcons", "TableOfContents"]
          ),
        });

        addIntegration({
          name: "starlight-view-modes-integration",
          hooks: {
            "astro:config:setup": ({
              config: astroConfig,
              injectRoute,
              updateConfig,
            }) => {
              updateConfig({
                vite: {
                  plugins: [
                    vitePluginStarlightViewModes(
                      config,
                      starlightConfig,
                      astroConfig
                    ),
                  ],
                },
              });

              if (config.zenModeSettings.enabled) {
                injectRoute({
                  entrypoint: "starlight-view-modes/routes/ZenMode.astro",
                  pattern: "[...locale]/zen-mode/[...path]",
                  prerender: true,
                });
              }

              if (config.presentationModeSettings.enabled) {
                injectRoute({
                  entrypoint:
                    "starlight-view-modes/routes/PresentationMode.astro",
                  pattern: "[...locale]/presentation-mode/[...path]",
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
