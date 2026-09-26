import type { StarlightViewModesRouteData } from "../data";

export function getModeSwitches(
  routeData: StarlightViewModesRouteData
): ModeSwitch[] {
  const defaultMode = routeData.modes.find((mode) => mode.name === "default");

  return routeData.modes
    .filter((mode) => mode.name !== "default")
    .map((mode) => resolveModeSwitch(mode, defaultMode));
}

export function resolveModeSwitch(
  mode: ViewMode,
  defaultMode: ViewMode | undefined
): ModeSwitch {
  const target = mode.isCurrent && defaultMode ? defaultMode : mode;

  return {
    href: target.href,
    icon: mode.icon,
    keyboardShortcuts: mode.keyboardShortcuts,
    name: mode.name,
    text: target.switchToText,
  };
}

type ViewMode = StarlightViewModesRouteData["modes"][number];

export interface ModeSwitch {
  href: string;
  icon: ViewMode["icon"];
  keyboardShortcuts: ViewMode["keyboardShortcuts"];
  name: string;
  text: string;
}
