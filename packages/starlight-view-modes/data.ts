import { AVAILABLE_MODES } from "./constants";

export type AvailableMode = (typeof AVAILABLE_MODES)[number] | "default";

export interface StarlightViewModesRouteData {
  /**
   * Indicates if the current page is associated with a topic or not.
   */
  currentMode: AvailableMode;
}
