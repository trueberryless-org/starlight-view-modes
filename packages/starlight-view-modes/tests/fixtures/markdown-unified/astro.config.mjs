import { unified } from "@astrojs/markdown-remark";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightViewModes from "starlight-view-modes";

// https://astro.build/config
export default defineConfig({
  markdown: {
    processor: unified(),
  },
  integrations: [
    starlight({
      title: "Starlight View Modes",
      plugins: [starlightViewModes()],
      sidebar: [
        {
          label: "Start Here",
          items: [{ label: "Demo", link: "/demo/" }],
        },
      ],
    }),
  ],
});
