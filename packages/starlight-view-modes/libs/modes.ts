import type { APIContext } from "astro";
import astroConfig from "virtual:starlight-view-modes-context";

import type { StarlightViewModesRouteData } from "../data";
import { type AvailableMode, AvailableModes } from "../definitions";
import { getCurrentModeFromPath, getUpdatedModePathname } from "./mode";
import { trimToExactlyOneLeadingSlash } from "./path";

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

  if (currentMode === "default") {
    modes.push({
      name: currentMode,
      link: trimToExactlyOneLeadingSlash(id),
      isCurrent: true,
    });
  } else {
    const currentModeData = AvailableModes.find(
      (mode) => mode.name === currentMode
    );
    modes.push({
      name: currentMode,
      icon:
        (currentModeData as Exclude<AvailableMode, { name: "default" }>)
          ?.disableIcon ?? "",
      link: trimToExactlyOneLeadingSlash(id),
      isCurrent: true,
    });
  }

  for (const mode of AvailableModes) {
    if (mode.name === currentMode) continue;
    const link = await getUpdatedModePathname(id, mode.name);
    if (mode.name !== "default") {
      modes.push({
        name: mode.name,
        icon: (mode as Exclude<AvailableMode, { name: "default" }>).enableIcon,
        link: trimToExactlyOneLeadingSlash(link),
        isCurrent: false,
      });
    } else {
      modes.push({
        name: mode.name,
        link: trimToExactlyOneLeadingSlash(link),
        isCurrent: false,
      });
    }
  }

  return { modes };
}
