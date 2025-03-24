import { defineRouteMiddleware } from "@astrojs/starlight/route-data";
import type { APIContext } from "astro";

import { appendModePathname } from "./libs/modeClient";
import { getRouteData } from "./libs/modes";
import { modifySidebarAndPagination } from "./libs/sidebar";

export const onRequest = defineRouteMiddleware(async (context) => {
  const { starlightRoute } = context.locals;
  const { id, sidebar, pagination, siteTitleHref } = starlightRoute;

  await modifySidebarAndPagination(starlightRoute, id, sidebar, pagination);
  await attachRouteData(context);

  const currentMode = context.locals.starlightViewModes.modes.find(
    (mode) => mode.isCurrent
  );

  if (currentMode && currentMode.name !== "default")
    starlightRoute.siteTitleHref = appendModePathname(
      siteTitleHref,
      currentMode.name
    );
});

async function attachRouteData(context: APIContext) {
  context.locals.starlightViewModes = await getRouteData(context);
}
