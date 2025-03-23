import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import type { APIContext } from "astro";

import type { StarlightViewModesRouteData } from "./data";
import { appendModePathname } from "./libs/modeClient";
import { type ViewMode, modifySidebarAndPagination } from "./libs/sidebar";

export const onRequest = defineRouteMiddleware(async (context) => {
  const { starlightRoute } = context.locals;
  const { id, sidebar, pagination, siteTitleHref } = starlightRoute;

  const currentMode = await modifySidebarAndPagination(id, sidebar, pagination);
  starlightRoute.sidebar = currentMode.sidebar;
  starlightRoute.pagination = currentMode.pagination;

  if (currentMode.mode !== "default")
    starlightRoute.siteTitleHref = appendModePathname(
      siteTitleHref,
      currentMode.mode
    );

  attachRouteData(context, currentMode);
});

function attachRouteData(context: APIContext, currentMode: ViewMode) {
  // @ts-expect-error
  context.locals.starlightViewModes = getRouteData(currentMode);
}

function getRouteData(currentMode: ViewMode): StarlightViewModesRouteData {
  return {
    currentMode: currentMode.mode,
  };
}
