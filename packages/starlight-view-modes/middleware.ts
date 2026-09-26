import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

import { getRouteData, getSiteTitleHref } from "./libs/routeData";
import { updateSidebarAndPagination } from "./libs/sidebar";

export const onRequest = defineRouteMiddleware(async (context) => {
  const { starlightRoute } = context.locals;

  await updateSidebarAndPagination(starlightRoute);

  const routeData = await getRouteData(starlightRoute, context.locals.t);

  context.locals.starlightViewModes = routeData;
  starlightRoute.siteTitleHref = getSiteTitleHref(
    starlightRoute.siteTitleHref,
    routeData
  );
});
