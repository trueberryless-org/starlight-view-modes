import config from "virtual:starlight-view-modes-config";

import { getLocalizedExclude } from "./i18n";
import { type Shortcut, parseShortcut } from "./shortcuts";

// Icons from: https://iconmonstr.com

export const AvailableModes: AvailableMode[] = [
  {
    name: "default",
    title: "starlightViewModes.defaultMode.title",
    switchToText: "starlightViewModes.defaultMode.switchTo",
  },
  {
    name: "zen-mode",
    title: "starlightViewModes.zenMode.title",
    switchToText: "starlightViewModes.zenMode.switchTo",
    enabled: config.zenModeSettings.enabled,
    exclude: getLocalizedExclude(config.zenModeSettings.exclude),
    enableIcon:
      '<path d="M22 13a10 10 0 1 0-20 0c0 4.32 3.09 10 10 10 6.93 0 10-5.7 10-10zm-10 8a8.01 8.01 0 0 1 0-16 8.01 8.01 0 0 1 0 16zm3-4H9v-1.57l3.82-4.83H9V9h6v1.58l-3.79 4.84H15V17zM.8 8.71a4.99 4.99 0 0 1 6.91-6.9 12.04 12.04 0 0 0-6.9 6.9zM19 1a5 5 0 0 0-2.72.8 12.06 12.06 0 0 1 6.92 6.91A4.99 4.99 0 0 0 19 1z" />',
    disableIcon:
      '<path d="M22 13a10 10 0 1 0-20 0c0 4.32 3.08 10 10 10 6.93 0 10-5.7 10-10Zm-10 8a8.01 8.01 0 0 1 0-16 8.01 8.01 0 0 1 0 16ZM.8 8.71a4.99 4.99 0 0 1 6.91-6.9 12.04 12.04 0 0 0-6.9 6.9ZM19 1a5 5 0 0 0-2.72.8 12.06 12.06 0 0 1 6.92 6.91A4.99 4.99 0 0 0 19 1Z" /><path d="M14.22 9.72 12 11.94 9.78 9.72a.75.75 0 0 0-1.06 1.06L10.94 13l-2.22 2.22a.75.75 0 0 0 1.06 1.06L12 14.06l2.23 2.22a.75.75 0 0 0 1.06-1.06L13.06 13l2.22-2.22a.75.75 0 0 0-1.06-1.06Z" />',
    keyboardShortcut: config.zenModeSettings.keyboardShortcut.map((k) =>
      parseShortcut(k, "zen-mode")
    ),
  },
  {
    name: "presentation-mode",
    title: "starlightViewModes.presentationMode.title",
    switchToText: "starlightViewModes.presentationMode.switchTo",
    enabled: config.presentationModeSettings.enabled,
    exclude: getLocalizedExclude(config.presentationModeSettings.exclude),
    enableIcon:
      '<path d="M4 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm10 2c.7 0 1.37-.13 2-.35V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6.35a5.95 5.95 0 0 0 7-2.34A6 6 0 0 0 14 13zm4 1v4l6 3V11l-6 3zM14 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>',
    disableIcon:
      '<path d="M22 14.24v3.52l-2-1v-1.52l2-1zM24 11l-6 3v4l6 3V11zm-10 2v5.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V13c-.7 0-1.37-.13-2-.35V19c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2v-6.35c-.63.22-1.3.35-2 .35zm0-8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM4 5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm10-2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>',
    keyboardShortcut: config.presentationModeSettings.keyboardShortcut.map(
      (k) => parseShortcut(k, "presentation-mode")
    ),
  },
];

export const AdditionalModes: AdditionalMode[] =
  AvailableModes.filter(isAdditionalMode);

export type AvailableMode =
  | {
      name: "default";
      title: keyof StarlightApp.I18n;
      switchToText: keyof StarlightApp.I18n;
    }
  | {
      name: string;
      title: keyof StarlightApp.I18n;
      switchToText: keyof StarlightApp.I18n;
      enabled: boolean;
      exclude: string[];
      enableIcon: string;
      disableIcon: string;
      keyboardShortcut: Shortcut[];
    };

export type AdditionalMode = Exclude<AvailableMode, { name: "default" }>;

export function isAdditionalMode(mode: AvailableMode): mode is AdditionalMode {
  return mode.name !== "default";
}
