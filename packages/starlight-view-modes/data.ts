import type { AvailableMode } from "./libs/definitions";

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
     * The name of the view mode but in readable form.
     */
    title: string;
    /**
     * The link to the same page in this view mode.
     */
    link: string;
    /**
     * The icon of the view mode.
     * This will be a disable icon if this is the current mode.
     * This will always be undefined for the default mode.
     *
     * In other words: The icon symbolizes the link (exception: current mode).
     */
    icon?: string;
    /**
     * Indicates if the current page is part of the view mode.
     */
    isCurrent: boolean;
  }[];
}
