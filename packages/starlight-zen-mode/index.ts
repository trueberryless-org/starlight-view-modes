import type { StarlightPlugin, StarlightUserConfig } from "@astrojs/starlight/types";
import { AstroError } from "astro/errors";
import { z } from "astro/zod";

import { starlightZenModeIntegration } from "./libs/integration";

const starlightZenModeConfigSchema = z
    .object({
        /**
         * Indicates if Zen Mode is enabled. When enabled, the user is able to active Zen Mode which
         * provides a distraction-free interface by hiding everything except the main content.
         *
         * @type {boolean}
         * @default true
         */
        zenModeEnabled: z.boolean().default(true),

        /**
         * Indicates if Presentation Mode is enabled. When enabled, the user is able to active Presentation Mode which
         * converts the main content into a presentation-like view intended for teaching or presentation purposes.
         *
         * @type {boolean}
         * @default true
         */
        presentationModeEnabled: z.boolean().default(true),
    })
    .default({});

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

                // If the user has already has a custom override for the PageSidebar component, don't override it.
                if (config.components?.PageSidebar) {
                    logger.warn(
                        "It looks like you already have a `PageSidebar` component override in your Starlight configuration."
                    );
                    logger.warn(
                        "To render `@astrojs/starlight-zen-mode`, remove the override for the `PageSidebar` component.\n"
                    );
                } else {
                    // Otherwise, add the PageSidebar component override to the user's configuration.
                    updatedConfig.components.PageSidebar =
                        "starlight-zen-mode/overrides/PageSidebar.astro";
                }

                // If the user has already has a custom override for the MarkdownContent component, don't override it.
                if (config.components?.MarkdownContent) {
                    logger.warn(
                        "It looks like you already have a `MarkdownContent` component override in your Starlight configuration."
                    );
                    logger.warn(
                        "To render `@astrojs/starlight-zen-mode`, remove the override for the `MarkdownContent` component.\n"
                    );
                } else {
                    // Otherwise, add the MarkdownContent component override to the user's configuration.
                    updatedConfig.components.MarkdownContent =
                        "starlight-zen-mode/overrides/MarkdownContent.astro";
                }

                addIntegration(starlightZenModeIntegration(parsedConfig.data));
                updateConfig(updatedConfig);
            },
        },
    };
}

export type StarlightZenModeUserConfig = z.input<typeof starlightZenModeConfigSchema>;
export type StarlightZenModeConfig = z.output<typeof starlightZenModeConfigSchema>;
