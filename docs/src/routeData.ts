import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

export const onRequest = defineRouteMiddleware((context) => {
  // @ts-expect-error
  const currentMode = context.locals.starlightViewModes.currentMode;

  console.log("currentMode", currentMode);
});
