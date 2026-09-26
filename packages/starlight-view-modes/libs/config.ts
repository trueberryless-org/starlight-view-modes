import { z } from "astro/zod";

import { throwPluginError } from "./error";

const keyboardShortcutPattern = /^(?:(?:Ctrl|Shift|Alt)\+)*[a-zA-Z0-9]$/;

const displayOptionsSchema = z
  .object({
    showHeader: z.boolean().default(false),
    showSidebar: z.boolean().default(false),
    showTableOfContents: z.boolean().default(true),
    showFooter: z.boolean().default(true),
  })
  .prefault({})
  .refine((options) => Object.values(options).includes(false), {
    message: "At least one element must be hidden in Zen mode.",
  });

const keyboardShortcutSchema = z
  .string()
  .transform((shortcut) => [shortcut])
  .or(z.string().array())
  .default([])
  .superRefine((shortcuts, ctx) => {
    for (const shortcut of getInvalidKeyboardShortcuts(shortcuts)) {
      ctx.addIssue({
        code: "custom",
        message: getInvalidKeyboardShortcutMessage(shortcut),
      });
    }
  });

const configSchema = z
  .object({
    zenModeSettings: z
      .object({
        enabled: z.boolean().default(true),
        displayOptions: displayOptionsSchema,
        exclude: z.array(z.string()).default([]),
        keyboardShortcut: keyboardShortcutSchema,
      })
      .prefault({}),
    presentationModeSettings: z
      .object({
        enabled: z.boolean().default(true),
        exclude: z.array(z.string()).default([]),
        keyboardShortcut: keyboardShortcutSchema,
        splitHeadingLevel: z.union([z.literal(2), z.literal(3)]).default(3),
        transition: z
          .enum(["none", "fade", "slide", "convex", "concave", "zoom"])
          .default("slide"),
        slideNumber: z.boolean().default(true),
      })
      .prefault({}),
  })
  .prefault({});

export function validateConfig(userConfig: unknown): StarlightViewModesConfig {
  const config = configSchema.safeParse(userConfig);

  if (!config.success) {
    throwPluginError(`Invalid starlight-view-modes configuration:

${z.prettifyError(config.error)}
`);
  }

  return config.data;
}

function getInvalidKeyboardShortcuts(shortcuts: string[]): string[] {
  return shortcuts.filter(
    (shortcut) => !keyboardShortcutPattern.test(shortcut)
  );
}

function getInvalidKeyboardShortcutMessage(shortcut: string): string {
  return (
    "A `keyboardShortcut` in your Starlight View Modes config does not match the expected string format.\n\n" +
    `You should correctly pass a valid keyboard shortcut, like \`Ctrl+K\` or \`Ctrl+Shift+K\`, but you passed \`${shortcut}\`.\n\n` +
    "- More about Starlight View Modes' keyboard shortcuts: https://starlight-view-modes.netlify.app/configuration/#keyboardshortcut"
  );
}

export type StarlightViewModesUserConfig = z.input<typeof configSchema>;
export type StarlightViewModesConfig = z.output<typeof configSchema>;
export type ZenModeDisplayOptions =
  StarlightViewModesConfig["zenModeSettings"]["displayOptions"];
export type PresentationModeSettings =
  StarlightViewModesConfig["presentationModeSettings"];
