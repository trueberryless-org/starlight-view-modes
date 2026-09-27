import type { StarlightRouteData } from "@astrojs/starlight/route-data";
import context from "virtual:starlight-view-modes/context";

import type { StarlightViewModesRouteData } from "../data";
import {
  AdditionalModes,
  type AvailableMode,
  AvailableModes,
  isAdditionalMode,
} from "./modes";
import { stripTrailingSlash, trimToExactlyOneLeadingSlash } from "./path";
import { getCurrentModeFromPath, getModePages, hasModePage } from "./server";
import {
  getPathnamePageKey,
  getUpdatedModePathname,
  insertModePathname,
} from "./utils";

export async function getRouteData(
  starlightRoute: StarlightRouteData,
  t: Translate
): Promise<StarlightViewModesRouteData> {
  const currentMode = await getCurrentModeFromPath(starlightRoute.id);
  const id = getIdWithBase(starlightRoute.id);
  const modes: StarlightViewModesRouteData["modes"] = [];
  // Pages of the docs collection can be in a directory named like a mode.
  const pageKey =
    currentMode === "default"
      ? starlightRoute.id
      : getPathnamePageKey(starlightRoute.id);

  for (const mode of AvailableModes) {
    if (mode.name === currentMode) {
      modes.push(getModeData(mode, id, true, t));
    } else if (await isAvailableForPage(mode, pageKey)) {
      // Pages in the default mode can be in a directory named like a mode, which must not be replaced.
      const href =
        currentMode === "default"
          ? insertModePathname(id, mode.name)
          : await getUpdatedModePathname(id, mode.name);

      modes.push(getModeData(mode, href, false, t));
    }
  }

  return { modes };
}

export async function getSiteTitleHref(
  siteTitleHref: string,
  routeData: StarlightViewModesRouteData
): Promise<string> {
  const currentMode = AdditionalModes.find(
    (mode) =>
      mode.name === routeData.modes.find(({ isCurrent }) => isCurrent)?.name
  );
  if (!currentMode) return siteTitleHref;

  const pages = await getModePages(currentMode);

  return hasModePage(pages, getPathnamePageKey(siteTitleHref))
    ? insertModePathname(siteTitleHref, currentMode.name)
    : siteTitleHref;
}

async function isAvailableForPage(
  mode: AvailableMode,
  id: string
): Promise<boolean> {
  if (!isAdditionalMode(mode)) return true;

  return mode.enabled && hasModePage(await getModePages(mode), id);
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
