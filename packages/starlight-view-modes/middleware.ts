import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

import { appendModePathname } from "./libs/modeClient";
import { currentModeKey } from "./libs/shared";
import { getCurrentMode } from "./libs/sidebar";

export const onRequest = defineRouteMiddleware((context) => {
  const { starlightRoute } = context.locals;
  const { id, sidebar, pagination, siteTitleHref } = starlightRoute;

  const currentMode = getCurrentMode(id, sidebar, pagination);
  starlightRoute.sidebar = currentMode.sidebar;
  starlightRoute.pagination = currentMode.pagination;

  starlightRoute[currentModeKey] = currentMode.mode;

  if (currentMode.mode !== "default")
    starlightRoute.siteTitleHref = appendModePathname(
      siteTitleHref,
      currentMode.mode
    );
});
