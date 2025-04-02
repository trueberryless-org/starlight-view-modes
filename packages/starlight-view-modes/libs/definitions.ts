import config from "virtual:starlight-view-modes-config";

import { getLocalizedExclude } from "./i18n";
import { type Shortcut, parseShortcut } from "./shortcuts";

export const AvailableModes: AvailableMode[] = [
  {
    name: "default",
    title: "starlightViewModes.defaultMode.title",
  },
  {
    name: "zen-mode",
    title: "starlightViewModes.zenMode.title",
    enabled: config.zenModeSettings.enabled,
    exclude: getLocalizedExclude(config.zenModeSettings.exclude),
    enableIcon:
      '<path d="M22 13a10 10 0 1 0-20 0c0 4.32 3.09 10 10 10 6.93 0 10-5.7 10-10zm-10 8a8.01 8.01 0 0 1 0-16 8.01 8.01 0 0 1 0 16zm3-4H9v-1.57l3.82-4.83H9V9h6v1.58l-3.79 4.84H15V17zM.8 8.71a4.99 4.99 0 0 1 6.91-6.9 12.04 12.04 0 0 0-6.9 6.9zM19 1a5 5 0 0 0-2.72.8 12.06 12.06 0 0 1 6.92 6.91A4.99 4.99 0 0 0 19 1z" />',
    disableIcon:
      '<path d="M22 13a10 10 0 1 0-20 0c0 4.32 3.08 10 10 10 6.93 0 10-5.7 10-10Zm-10 8a8.01 8.01 0 0 1 0-16 8.01 8.01 0 0 1 0 16ZM.8 8.71a4.99 4.99 0 0 1 6.91-6.9 12.04 12.04 0 0 0-6.9 6.9ZM19 1a5 5 0 0 0-2.72.8 12.06 12.06 0 0 1 6.92 6.91A4.99 4.99 0 0 0 19 1Z" /><path d="M14.22 9.72 12 11.94 9.78 9.72a.75.75 0 0 0-1.06 1.06L10.94 13l-2.22 2.22a.75.75 0 0 0 1.06 1.06L12 14.06l2.23 2.22a.75.75 0 0 0 1.06-1.06L13.06 13l2.22-2.22a.75.75 0 0 0-1.06-1.06Z" />',
    keyboardShortcut:
      config.zenModeSettings.keyboardShortcut.map(parseShortcut),
  },
];

export const AdditionalModes: AdditionalMode[] =
  AvailableModes.filter(isAdditionalMode);

export type AvailableMode =
  | {
      name: "default";
      title: keyof StarlightApp.I18n;
    }
  | {
      name: string;
      title: keyof StarlightApp.I18n;
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
