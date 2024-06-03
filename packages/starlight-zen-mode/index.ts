import type { StarlightPlugin, StarlightUserConfig } from "@astrojs/starlight/types";
import { AstroError } from "astro/errors";
import { z } from "astro/zod";

import { starlightZenModeIntegration } from "./libs/integration";

const starlightZenModeConfigSchema = z.object({}).default({});

export default function starlightZenMode(userConfig?: StarlightZenModeUserConfig): StarlightPlugin {
    const parsedConfig = starlightZenModeConfigSchema.safeParse(userConfig);

    if (!parsedConfig.success) {
        throw new AstroError(
            `The provided plugin configuration is invalid.\n${parsedConfig.error.issues
                .map((issue) => issue.message)
                .join("\n")}`,
            `See the error report above for more informations.\n\nIf you believe this is a bug, please file an issue at https://github.com/trueberryless/starlight-zen-mode/issues`
        );
    }

    return {
        name: "starlight-zen-mode",
        hooks: {
            setup({ addIntegration, config, logger, updateConfig }) {
                const updatedConfig: Partial<StarlightUserConfig> = {
                    components: { ...config.components },
                };

                if (!updatedConfig.components) {
                    updatedConfig.components = {};
                }

                // If the user has already has a custom override for the TwoColumnContent component, don't override it.
                if (config.components?.TwoColumnContent) {
                    logger.warn(
                        "It looks like you already have a `TwoColumnContent` component override in your Starlight configuration."
                    );
                    logger.warn(
                        "To render `@astrojs/starlight-zen-mode`, remove the override for the `TwoColumnContent` component.\n"
                    );
                } else {
                    // Otherwise, add the TwoColumnContent component override to the user's configuration.
                    updatedConfig.components.TwoColumnContent =
                        "starlight-zen-mode/overrides/TwoColumnContent.astro";
                }

                addIntegration(starlightZenModeIntegration(parsedConfig.data));
                updateConfig(updatedConfig);
            },
        },
    };
}

export type StarlightZenModeUserConfig = z.input<typeof starlightZenModeConfigSchema>;
export type StarlightZenModeConfig = z.output<typeof starlightZenModeConfigSchema>;
