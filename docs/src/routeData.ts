import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware((context) => {
  const currentMode = context.locals.starlightViewModes.currentMode;
  console.log("currentMode", currentMode);
});
