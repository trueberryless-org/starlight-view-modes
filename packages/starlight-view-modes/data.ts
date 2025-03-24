import { type AvailableMode } from "./constants";

export interface StarlightViewModesRouteData {
  /**
   * Indicates if the current page is associated with a topic or not.
   */
  currentMode: AvailableMode;
}
