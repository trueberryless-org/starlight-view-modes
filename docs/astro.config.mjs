import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import starlightViewModes from "starlight-view-modes";
import starlightImageZoom from "starlight-image-zoom";
import starlightPluginShowLatestVersion from "starlight-plugin-show-latest-version";
import starlightPluginsDocsComponents from "@trueberryless-org/starlight-plugins-docs-components";

import node from "@astrojs/node";

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
              showSidebar: false,
              showTableOfContents: true,
              showFooter: true,
            },
            exclude: ["/resources/*"],
          },
        }),
        starlightImageZoom(),
        starlightPluginShowLatestVersion({
          source: {
            type: "npm",
            slug: "starlight-view-modes",
          },
          showInSiteTitle: "deferred",
        }),
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Getting Started", link: "/getting-started/" },
            { label: "Configuration", link: "/configuration/" },
            { label: "Demo", link: "/demo/" },
          ],
        },
      ],
      credits: true,
    }),
  ],
  adapter: node({
    mode: "standalone",
  }),
});
