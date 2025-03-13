import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import { getCurrentMode } from "./libs/sidebar";
import { currentModeKey } from "./libs/shared";

export const onRequest = defineRouteMiddleware((context) => {
  const { starlightRoute } = context.locals;
  const { id, sidebar, pagination, siteTitleHref } = starlightRoute;

  const currentMode = getCurrentMode(id, sidebar, pagination);
  starlightRoute.sidebar = currentMode.sidebar;
  starlightRoute.pagination = currentMode.pagination;

  starlightRoute[currentModeKey] = currentMode.mode;

  if (currentMode.mode !== "default")
    starlightRoute.siteTitleHref = `/${currentMode.mode}${siteTitleHref}`;
});
