import type { APIContext } from "astro";
import astroConfig from "virtual:starlight-view-modes-context";

import type { StarlightViewModesRouteData } from "../data";
import { type AvailableMode, AvailableModes } from "./definitions";
import { trimToExactlyOneLeadingSlash } from "./path";
import { getCurrentModeFromPath } from "./server";
import { getUpdatedModePathname } from "./utils";

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

  const currentModeData = AvailableModes.find(
    (mode) => mode.name === currentMode
  )!;
  addMode(modes, currentModeData, id, true);

  for (const mode of AvailableModes) {
    if (mode.name === currentMode) continue;
    if (
      mode.name !== "default" &&
      (mode as Exclude<AvailableMode, { name: "default" }>).enabled === false
    )
      continue;

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
  if (mode.name !== "default") {
    modes.push({
      name: mode.name,
      title: mode.title,
      icon: isCurrent
        ? (mode as Exclude<AvailableMode, { name: "default" }>).disableIcon
        : (mode as Exclude<AvailableMode, { name: "default" }>).enableIcon,
      link: trimToExactlyOneLeadingSlash(link),
      isCurrent,
    });
  } else {
    modes.push({
      name: mode.name,
      title: mode.title,
      link: trimToExactlyOneLeadingSlash(link),
      isCurrent,
    });
  }
}
