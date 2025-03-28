import type { APIContext } from "astro";
import astroConfig from "virtual:starlight-view-modes-context";

import type { StarlightViewModesRouteData } from "../data";
import {
  type AvailableMode,
  AvailableModes,
  isAdditionalMode,
} from "./definitions";
import { stripLeadingSlash, trimToExactlyOneLeadingSlash } from "./path";
import { getCurrentModeFromPath } from "./server";
import { getUpdatedModePathname, isExcludedPage } from "./utils";

export async function getRouteData(
  context: APIContext
): Promise<StarlightViewModesRouteData> {
  let { id } = context.locals.starlightRoute;
  const currentMode = await getCurrentModeFromPath(id);
  const base = astroConfig?.base || "";
  if (base !== "" && base !== "/") {
    id = `${base}/${id}`;
  }

  let modes: StarlightViewModesRouteData["modes"] = [];

  for (const mode of AvailableModes) {
    if (mode.name === currentMode) {
      addMode(modes, mode, id, true);
      continue;
    }
    if (isAdditionalMode(mode)) {
      if (mode.enabled === false) continue;
      if (isExcludedPage(stripLeadingSlash(id), mode.exclude)) continue;
    }

    const link = await getUpdatedModePathname(id, mode.name);
    addMode(modes, mode, link, false);
  }

  return { modes };
}

function addMode(
  modes: StarlightViewModesRouteData["modes"],
  mode: AvailableMode,
  link: string,
  isCurrent: boolean
) {
  if (isAdditionalMode(mode)) {
    modes.push({
      name: mode.name,
      title: mode.title,
      icon: isCurrent ? mode.disableIcon : mode.enableIcon,
      href: trimToExactlyOneLeadingSlash(link),
      isCurrent,
    });
  } else {
    modes.push({
      name: mode.name,
      title: mode.title,
      href: trimToExactlyOneLeadingSlash(link),
      isCurrent,
    });
  }
}
