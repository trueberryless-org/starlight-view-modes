import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightViewModes from "starlight-view-modes";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Starlight View Modes",
      pagefind: false,
      plugins: [
        starlightViewModes({
          zenModeSettings: { keyboardShortcut: "Ctrl+Shift+Z" },
        }),
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
