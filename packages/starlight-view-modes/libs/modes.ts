import type { APIContext } from "astro";

import { AVAILABLE_MODES } from "../constants";
import type { StarlightViewModesRouteData } from "../data";
import { getCurrentModeFromPath, getUpdatedModePathname } from "./mode";

export async function getRouteData(
  context: APIContext
): Promise<StarlightViewModesRouteData> {
  const { id } = context.locals.starlightRoute;
  const currentMode = await getCurrentModeFromPath(id);

  let modes: StarlightViewModesRouteData["modes"] = [];
  modes.push({
    name: currentMode,
    link: id,
    isCurrent: true,
  });

  for (const mode of [...AVAILABLE_MODES, "default"]) {
    if (mode === currentMode) continue;
    const link = await getUpdatedModePathname(id, mode);
    modes.push({
      name: mode,
      link,
      isCurrent: false,
    });
  }

  return { modes };
}
