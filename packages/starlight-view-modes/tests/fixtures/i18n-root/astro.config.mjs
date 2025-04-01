import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";
import starlightViewModes from "starlight-view-modes";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Starlight View Modes",
      locales: {
        root: {
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
          translations: { "zh-CN": "从这里开始" },
          items: [
            {
              label: "Demo",
              translations: { "zh-CN": "演示" },
              link: "/demo/",
            },
          ],
        },
      ],
    }),
  ],
});
