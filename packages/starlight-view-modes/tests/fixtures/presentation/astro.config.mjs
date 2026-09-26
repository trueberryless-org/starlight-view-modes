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
          presentationModeSettings: { keyboardShortcut: "Ctrl+Shift+Y" },
        }),
      ],
      sidebar: [
        {
          label: "Course",
          items: [
            { label: "Lesson", link: "/lesson/" },
            { label: "Homework", link: "/homework/" },
          ],
        },
      ],
    }),
  ],
});
