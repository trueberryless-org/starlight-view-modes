import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightLinksValidator from "starlight-links-validator";
import starlightViewModes from "starlight-view-modes";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Starlight View Modes",
      plugins: [starlightLinksValidator(), starlightViewModes()],
      sidebar: [
        {
          label: "Start Here",
          items: [{ label: "Demo", link: "/demo/" }],
        },
      ],
    }),
  ],
});
