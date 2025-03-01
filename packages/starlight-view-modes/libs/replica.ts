import type { StarlightUserConfig } from "@astrojs/starlight/types";
import type { StarlightViewModesConfig } from "./config";

export function replicateStarlightSite(
  config: {
    mode: string;
    entrypoint: string;
  },
  hooks: {
    injectRoute: (config: {
      pattern: string;
      entrypoint: string | URL;
      prerender?: boolean;
    }) => void;
    addRouteMiddleware: (config: {
      entrypoint: string;
      order?: "pre" | "post" | "default";
    }) => void;
  },
  data: {
    starlightConfig: StarlightUserConfig;
    config: StarlightViewModesConfig;
  }
) {}
