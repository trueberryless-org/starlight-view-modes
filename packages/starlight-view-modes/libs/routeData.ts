import type { StarlightRouteData } from "@astrojs/starlight/route-data";
import context from "virtual:starlight-view-modes/context";

import type { StarlightViewModesRouteData } from "../data";
import { type AvailableMode, AvailableModes, isAdditionalMode } from "./modes";
import {
  stripLeadingSlash,
  stripTrailingSlash,
  trimToExactlyOneLeadingSlash,
} from "./path";
import { getCurrentModeFromPath } from "./server";
import {
  getUpdatedModePathname,
  insertModePathname,
  isExcludedPage,
} from "./utils";

export async function getRouteData(
  starlightRoute: StarlightRouteData,
  t: Translate
): Promise<StarlightViewModesRouteData> {
  const currentMode = await getCurrentModeFromPath(starlightRoute.id);
  const id = getIdWithBase(starlightRoute.id);
  const modes: StarlightViewModesRouteData["modes"] = [];

  for (const mode of AvailableModes) {
    if (mode.name === currentMode) {
      modes.push(getModeData(mode, id, true, t));
    } else if (isAvailableForPage(mode, id)) {
      modes.push(
        getModeData(mode, await getUpdatedModePathname(id, mode.name), false, t)
      );
    }
  }

  return { modes };
}

export function getSiteTitleHref(
  siteTitleHref: string,
  routeData: StarlightViewModesRouteData
): string {
  const currentMode = routeData.modes.find((mode) => mode.isCurrent);

  return currentMode && currentMode.name !== "default"
    ? insertModePathname(siteTitleHref, currentMode.name)
    : siteTitleHref;
}

function isAvailableForPage(mode: AvailableMode, id: string): boolean {
  if (!isAdditionalMode(mode)) return true;

  return mode.enabled && !isExcludedPage(stripLeadingSlash(id), mode.exclude);
}

function getModeData(
  mode: AvailableMode,
  link: string,
  isCurrent: boolean,
  t: Translate
): StarlightViewModesRouteData["modes"][number] {
  const data = {
    name: mode.name,
    title: t(mode.title),
    switchToText: t(mode.switchToText),
    href: trimToExactlyOneLeadingSlash(link),
    isCurrent,
  };

  if (!isAdditionalMode(mode)) return data;

  return {
    ...data,
    icon: isCurrent ? mode.disableIcon : mode.enableIcon,
    keyboardShortcuts: mode.keyboardShortcut,
  };
}

function getIdWithBase(id: string): string {
  const base = stripTrailingSlash(context.base || "");

  return base !== "" && base !== "/" ? `${base}/${id}` : id;
}

type Translate = (key: keyof StarlightApp.I18n) => string;
