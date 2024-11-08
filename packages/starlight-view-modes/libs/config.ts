import { AstroError } from "astro/errors";
import { z } from "astro/zod";

const configSchema = z
    .object({
        /**
         * All options related to Zen mode.
         *
         * @type {object}
         */
        zenModeSettings: z
            .object({
                /**
                 * Indicates if Zen mode is enabled. When enabled, the user is able to activate Zen mode which
                 * provides a distraction-free interface by hiding everything except the main content.
                 *
                 * @type {boolean}
                 * @default true
                 */
                enabled: z.boolean().default(true),

                /**
                 * Choose the position of the close button for Zen mode. It is only visible when Zen mode
                 * is active and can be in one of four corners: top left, top right, bottom left, or bottom right.
                 *
                 * @type {enum}
                 * @default "top-right"
                 */
                closeButtonPosition: z.enum(["top-left", "top-right", "bottom-left", "bottom-right"]).default("top-right"),

                /**
                 * Choose what elements should be hidden when Zen mode is active.
                 *
                 * @type {object}
                 * @default {}
                 */
                displayOptions: z
                    .object({
                        showHeader: z.boolean().default(false),
                        showSidebar: z.boolean().default(false),
                        showTableOfContents: z.boolean().default(true),
                        showFooter: z.boolean().default(true),
                    })
                    .default({
                        showHeader: false,
                        showSidebar: false,
                        showTableOfContents: true,
                        showFooter: true,
                    })
                    .refine(
                        (options) => {
                            const values = Object.values(options);
                            return values.includes(false);
                        },
                        {
                            message: "At least one element must be hidden in Zen mode.",
                        }
                    ),

                /**
                 * Controls the visibility of Zen mode switches in various parts of the interface.
                 *
                 * @type {object}
                 */
                switchVisibility: z
                    .object({
                        /**
                         * Locations where the Zen mode switch should appear. Possible values are:
                         * - "tableOfContents" for the table of contents sidebar
                         * - "header" for the main header
                         * - "headerMobile" for the header on mobile devices.
                         *
                         * @type {array}
                         * @default ["tableOfContents", "header", "headerMobile"]
                         */
                        location: z
                            .array(z.enum(["tableOfContents", "header", "headerMobile"]))
                            .default(["tableOfContents", "header", "headerMobile"]),
                    })
                    .default({
                        location: ["tableOfContents", "header", "headerMobile"],
                    }),
            })
            .default({
                enabled: true,
                closeButtonPosition: "top-right",
                displayOptions: {
                    showHeader: false,
                    showSidebar: false,
                    showTableOfContents: true,
                    showFooter: true,
                },
                switchVisibility: {
                    location: ["tableOfContents", "header", "headerMobile"],
                },
            }),
    })
    .default({});

export function validateConfig(userConfig: unknown): StarlightViewModesConfig {
    const config = configSchema.safeParse(userConfig);

    if (!config.success) {
        const errors = config.error.flatten();

        throw new AstroError(
            `Invalid @trueberryless-org/starlight-plugins-docs-components configuration:
      
      ${errors.formErrors.map((formError) => ` - ${formError}`).join("\n")}
      ${Object.entries(errors.fieldErrors)
          .map(([fieldName, fieldErrors]) => ` - ${fieldName}: ${fieldErrors.join(" - ")}`)
          .join("\n")}
        `,
            `See the error report above for more informations.\n\nIf you believe this is a bug, please file an issue at https://github.com/trueberryless-org/starlight-plugins-docs-components/issues/new`
        );
    }

    return config.data;
}

export type StarlightViewModesUserConfig = z.input<typeof configSchema>;
export type StarlightViewModesConfig = z.output<typeof configSchema>;
