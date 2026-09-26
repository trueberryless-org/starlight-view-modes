import type { AdditionalMode, AvailableMode } from "./libs/modes";

export interface StarlightViewModesRouteData {
  /**
   * A list of all configured view modes.
   */
  modes: {
    /**
     * The name of the view mode.
     */
    name: AvailableMode["name"];
    /**
     * The translated name of the view mode in readable form, e.g. "Zen Mode".
     */
    title: string;
    /**
     * The translated label of a link switching to this view mode, e.g. "Switch to Zen Mode".
     */
    switchToText: string;
    /**
     * The link to the same page in this view mode.
     */
    href: string;
    /**
     * The activation or deactivation icon of the view mode, depending on the current mode.
     * The default mode has no icon (`undefined`).
     */
    icon?: string;
    /**
     * Indicates if the current page is in this view mode right now.
     */
    isCurrent: boolean;
    /**
     * The keyboard shortcuts to switch to and from this view mode.
     */
    keyboardShortcuts?: AdditionalMode["keyboardShortcut"];
  }[];
}
