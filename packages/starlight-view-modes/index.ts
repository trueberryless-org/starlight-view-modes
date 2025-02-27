import type {
  StarlightPlugin,
  StarlightUserConfig,
} from "@astrojs/starlight/types";
import type { AstroIntegrationLogger } from "astro";

import {
  type StarlightViewModesConfig,
  validateConfig,
  type StarlightViewModesUserConfig,
} from "./libs/config";
// import { stripLeadingSlash, stripTrailingSlash } from "./libs/path";
import { vitePluginStarlightViewModesConfig } from "./libs/vite";
import { getFileNameZenMode } from "./libs/zenModeDisplayOptionsHelper";

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
        config: starlightConfig,
        logger,
        updateConfig: updateStarlightConfig,
      }) {
        updateStarlightConfig({
          components: {
            ...starlightConfig.components,
            ...overrideStarlightComponent(
              starlightConfig.components,
              logger,
              "PageSidebar"
            ),
          },
        });

        addIntegration({
          name: "starlight-view-modes-integration",
          hooks: {
            "astro:config:setup": ({ injectRoute, updateConfig }) => {
              const zenModeFileName = getFileNameZenMode(
                config.zenModeSettings.displayOptions
              );

              injectRoute({
                entrypoint: `starlight-view-modes/routes/zen-mode/${zenModeFileName}.astro`,
                pattern: "/zen-mode/[...path]",
                prerender: true,
              });

              updateConfig({
                vite: {
                  plugins: [vitePluginStarlightViewModesConfig(config)],
                },
              });
            },
          },
        });
      },
    },
  };
}

function overrideStarlightComponent(
  components: StarlightUserConfig["components"],
  logger: AstroIntegrationLogger,
  component: keyof NonNullable<StarlightUserConfig["components"]>
) {
  if (components?.[component]) {
    logger.warn(
      `It looks like you already have a \`${component}\` component override in your Starlight configuration.`
    );
    logger.warn(
      `To use \`starlight-view-modes\`, either remove your override or update it to render the content from \`starlight-view-modes/overrides/${component}.astro\`.`
    );

    return {};
  }

  return {
    [component]: `starlight-view-modes/overrides/${component}.astro`,
  };
}
