import type { StarlightPlugin, StarlightUserConfig } from "@astrojs/starlight/types";
import { AstroError } from "astro/errors";
import { z } from "astro/zod";

import { vitePluginStarlightViewModesConfig } from "./libs/vite";
import type { AstroIntegrationLogger } from "astro";

const starlightViewModesConfigSchema = z
    .object({
        /**
         * Indicates if Zen mode is enabled. When enabled, the user is able to active Zen mode which
         * provides a distraction-free interface by hiding everything except the main content.
         *
         * @type {boolean}
         * @default true
         */
        zenModeEnabled: z.boolean().default(true),

        /**
         * Choose the position of the close button for the Zen mode. It is only visible when the Zen mode
         * is active and can be in one of four corners: top left, top right, bottom left, or bottom right.
         *
         * @type {enum}
         * @default "top-right"
         */
        zenModeCloseButtonPosition: z
            .enum(["top-left", "top-right", "bottom-left", "bottom-right"])
            .default("top-right"),

        /**
         * Indicates if the header should be shown if the user is actively in Zen mode.
         *
         * @type {boolean}
         * @default false
         */
        zenModeShowHeader: z.boolean().default(false),

        /**
         * Indicates if the sidebar should be shown if the user is actively in Zen mode.
         *
         * @type {boolean}
         * @default false
         */
        zenModeShowSidebar: z.boolean().default(false),

        /**
         * Indicates if the table of contents should be shown if the user is actively in Zen mode.
         *
         * @type {boolean}
         * @default false
         */
        zenModeShowTableOfContents: z.boolean().default(true),

        /**
         * Indicates if the footer should be shown if the user is actively in Zen mode.
         *
         * @type {boolean}
         * @default true
         */
        zenModeShowFooter: z.boolean().default(true),

        /**
         * This option can enable or disable a button in the table of contents sidebar that will switch into Zen Mode or back from Zen Mode.
         *
         * @type {boolean}
         * @default true
         */
        zenModeShowSwitchInTableOfContents: z.boolean().default(true),

        /**
         * This option can enable or disable a button in the header that will switch into Zen Mode or back from Zen Mode.
         *
         * @type {boolean}
         * @default true
         */
        zenModeShowSwitchInHeader: z.boolean().default(true),

        /**
         * This option can enable or disable a button in the header of mobile devices that will switch into Zen Mode or back from Zen Mode.
         *
         * @type {boolean}
         * @default true
         */
        zenModeShowSwitchInHeaderMobile: z.boolean().default(true),

        /**
         * Indicates if Presentation Mode is enabled. When enabled, the user is able to active Presentation Mode which
         * converts the main content into a presentation-like view intended for teaching or presentation purposes.
         *
         * @type {boolean}
         * @default false
         */
        presentationModeEnabled: z.boolean().default(false),

        /**
         * Choose the position of the close button for the Presentation mode. It is only visible when the Presentation mode
         * is active and can be in one of four corners: top left, top right, bottom left, or bottom right.
         *
         * @type {enum}
         * @default "top-right"
         */
        presentationModeCloseButtonPosition: z
            .enum(["top-left", "top-right", "bottom-left", "bottom-right"])
            .default("top-right"),

        // /**
        //  * Choose the position of the control button for the Presentation Mode. It is only visible when the Presentation Mode
        //  * is active and can be in one of eight corners: top left, top middle, top right, middle right, bottom left, bottom middle, bottom right, or middle left.
        //  *
        //  * @type {enum}
        //  * @default "middle-right"
        //  */
        // presentationModeControlButtonPosition: z
        //     .enum([
        //         "top-left",
        //         "top-middle",
        //         "top-right",
        //         "middle-right",
        //         "bottom-left",
        //         "bottom-middle",
        //         "bottom-right",
        //         "middle-left",
        //     ])
        //     .default("middle-right"),

        /**
         * This option can enable or disable a button in the header that will switch into Presentation Mode or back from Presentation Mode.
         *
         * @type {boolean}
         * @default true
         */
        presentationModeShowSwitchInHeader: z.boolean().default(true),

        /**
         * This option can enable or disable a button in the header of mobile devices that will switch into Presentation Mode or back from Presentation Mode.
         *
         * @type {boolean}
         * @default true
         */
        presentationModeShowSwitchInHeaderMobile: z.boolean().default(true),

        /**
         * This option can enable or disable a button in the table of contents sidebar that will switch into Presentation Mode or back from Presentation Mode.
         *
         * @type {boolean}
         * @default true
         */
        presentationModeShowSwitchInTableOfContents: z.boolean().default(true),
    })
    .default({});

export default function starlightViewModes(
    userConfig?: StarlightViewModesUserConfig
): StarlightPlugin {
    const parsedConfig = starlightViewModesConfigSchema.safeParse(userConfig);

    if (!parsedConfig.success) {
        throw new AstroError(
            `The provided plugin configuration is invalid.\n${parsedConfig.error.issues
                .map((issue) => issue.message)
                .join("\n")}`,
            `See the error report above for more informations.\n\nIf you believe this is a bug, please file an issue at https://github.com/trueberryless/starlight-view-modes/issues`
        );
    }

    return {
        name: "starlight-view-modes",
        hooks: {
            setup({
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
                            injectRoute({
                                entrypoint: "starlight-view-modes/routes/ZenMode.astro",
                                pattern: "/zen-mode/[...path]",
                                prerender: true,
                            });

                            updateConfig({
                                vite: {
                                    plugins: [
                                        vitePluginStarlightViewModesConfig(parsedConfig.data),
                                    ],
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

export type StarlightViewModesUserConfig = z.input<typeof starlightViewModesConfigSchema>;
export type StarlightViewModesConfig = z.output<typeof starlightViewModesConfigSchema>;
