import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import { getCurrentMode } from "./libs/sidebar";

export const onRequest = defineRouteMiddleware((context) => {
  const { starlightRoute } = context.locals;
  const { id, sidebar, pagination } = starlightRoute;

  const currentMode = getCurrentMode(id, sidebar, pagination);
  starlightRoute.sidebar = currentMode.sidebar;
  starlightRoute.pagination = currentMode.pagination;
  starlightRoute.isZenMode = currentMode.isZenMode;
});
