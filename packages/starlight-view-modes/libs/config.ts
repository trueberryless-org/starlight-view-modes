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
          .default({})
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
         * Defines a list of pages or glob patterns that are not viewable in Zen mode.
         *
         * @default []
         */
        exclude: z.array(z.string()).default([]),

        /**
         * Defines a list of keyboard shortcuts which will activate and deactivate Zen mode.
         *
         * @default []
         */
        keyboardShortcut: z
          .string()
          .transform((string) => [string])
          .or(z.string().array())
          .default([])
          .superRefine((shortcuts, ctx) => {
            // Regex pattern to match invalid keyboard shortcuts: https://regex101.com/r/fgyKoV/1
            const invalidShortcutRegex =
              /^(?:(?:Ctrl|Shift|Alt)\+)*[a-zA-Z0-9]$/;
            const invalidShortcuts = shortcuts.filter(
              (shortcut) => !invalidShortcutRegex.test(shortcut)
            );
            for (const invalidShortcut of invalidShortcuts) {
              ctx.addIssue({
                code: "custom",
                message:
                  "A `keyboardShortcut` in your Starlight View Modes config does not match the expected string format.\n\n" +
                  `You should correctly pass a valid keyboard shortcut, like \`Ctrl+K\` or \`Ctrl+Shift+K\`, but you passed \`${invalidShortcut}\`.\n\n` +
                  "- More about Starlight View Modes' keyboard shortcuts: https://starlight-view-modes.trueberryless.org/configuration/#keyboardshortcut",
              });
            }
          }),
      })
      .default({}),

    /**
     * All options related to Presentation mode.
     *
     * @type {object}
     */
    presentationModeSettings: z
      .object({
        /**
         * Indicates if Presentation mode is enabled. When enabled, the user is able to activate Presentation mode which
         * provides a distraction-free interface by hiding everything except the main content.
         *
         * @type {boolean}
         * @default true
         */
        enabled: z.boolean().default(true),

        /**
         * Defines a list of pages or glob patterns that are not viewable in Presentation mode.
         *
         * @default []
         */
        exclude: z.array(z.string()).default([]),

        /**
         * Defines a list of keyboard shortcuts which will activate and deactivate Presentation mode.
         *
         * @default []
         */
        keyboardShortcut: z
          .string()
          .transform((string) => [string])
          .or(z.string().array())
          .default([])
          .superRefine((shortcuts, ctx) => {
            // Regex pattern to match invalid keyboard shortcuts: https://regex101.com/r/fgyKoV/1
            const invalidShortcutRegex =
              /^(?:(?:Ctrl|Shift|Alt)\+)*[a-zA-Z0-9]$/;
            const invalidShortcuts = shortcuts.filter(
              (shortcut) => !invalidShortcutRegex.test(shortcut)
            );
            for (const invalidShortcut of invalidShortcuts) {
              ctx.addIssue({
                code: "custom",
                message:
                  "A `keyboardShortcut` in your Starlight View Modes config does not match the expected string format.\n\n" +
                  `You should correctly pass a valid keyboard shortcut, like \`Ctrl+K\` or \`Ctrl+Shift+K\`, but you passed \`${invalidShortcut}\`.\n\n` +
                  "- More about Starlight View Modes' keyboard shortcuts: https://starlight-view-modes.trueberryless.org/configuration/#keyboardshortcut-1",
              });
            }
          }),
      })
      .default({}),
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
        .map(
          ([fieldName, fieldErrors]) =>
            ` - ${fieldName}: ${fieldErrors.join(" - ")}`
        )
        .join("\n")}
        `,
      `See the error report above for more informations.\n\nIf you believe this is a bug, please file an issue at https://github.com/trueberryless-org/starlight-plugins-docs-components/issues/new`
    );
  }

  return config.data;
}

export type StarlightViewModesUserConfig = z.input<typeof configSchema>;
export type StarlightViewModesConfig = z.output<typeof configSchema>;
