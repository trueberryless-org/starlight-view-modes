import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";
import starlightViewModes from "starlight-view-modes";

// https://astro.build/config
export default defineConfig({
  base: "/base-option/",
  integrations: [
    starlight({
      title: "Starlight View Modes",
      defaultLocale: "en",
      locales: {
        en: {
          label: "English",
          lang: "en",
        },
        "zh-cn": {
          label: "简体中文",
          lang: "zh-CN",
        },
      },
      plugins: [
        starlightLinksValidator({
          errorOnFallbackPages: false,
          errorOnInconsistentLocale: true,
        }),
        starlightViewModes(),
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [{ label: "Demo", link: "/demo/" }],
        },
      ],
    }),
  ],
});
