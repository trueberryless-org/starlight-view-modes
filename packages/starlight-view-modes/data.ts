export interface StarlightViewModesRouteData {
  /**
   * A list of all configured view modes.
   */
  modes: {
    /**
     * The name of the view mode.
     */
    name: string;
    /**
     * The link to the same page in this view mode.
     */
    link: string;
    /**
     * Indicates if the current page is part of the view mode.
     */
    isCurrent: boolean;
  }[];
}
