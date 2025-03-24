import starlight from "@astrojs/starlight";
import starlightPluginsDocsComponents from "@trueberryless-org/starlight-plugins-docs-components";
import { defineConfig } from "astro/config";
import starlightImageZoom from "starlight-image-zoom";
import starlightLinksValidator from "starlight-links-validator";
import starlightViewModes from "starlight-view-modes";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Starlight View Modes",
      logo: {
        light: "./src/assets/logo-light.png",
        dark: "./src/assets/logo-dark.png",
        replacesTitle: true,
      },
      customCss: ["./src/styles/custom.css"],
      social: {
        github: "https://github.com/trueberryless/starlight-view-modes",
      },
      editLink: {
        baseUrl:
          "https://github.com/trueberryless/starlight-view-modes/edit/main/docs/",
      },
      plugins: [
        starlightLinksValidator(),
        starlightPluginsDocsComponents({
          pluginName: "starlight-view-modes",
          showcaseProps: {
            entries: [
              {
                thumbnail: "./src/assets/crabrolls.png",
                href: "https://crabrolls-cartesi.github.io/crabrolls/",
                title: "CrabRolls",
              },
              {
                thumbnail: "./src/assets/koliantylers-dotfiles.png",
                href: "https://dotfiles.wiki/",
                title: "kiliantyler's Dotfiles",
              },
              {
                thumbnail: "./src/assets/alove.png",
                href: "https://alove.vercel.app/",
                title: "欢迎了解紧缚文化",
              },
            ],
          },
        }),
        starlightViewModes({
          zenModeSettings: {
            enabled: true,
            displayOptions: {
              showHeader: true,
              showSidebar: true,
              showTableOfContents: false,
              showFooter: true,
            },
            exclude: ["/resources/*"],
          },
        }),
        starlightImageZoom(),
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Getting Started", link: "/getting-started/" },
            { label: "Configuration", link: "/configuration/" },
            { label: "View Modes Data", link: "/view-modes-data/" },
          ],
        },
      ],
      credits: true,
    }),
  ],
});
