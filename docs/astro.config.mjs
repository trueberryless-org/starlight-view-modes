import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import starlightViewModes from "starlight-view-modes";
import starlightImageZoom from "starlight-image-zoom";
import starlightPluginShowLatestVersion from "starlight-plugin-show-latest-version";
// import starlightPluginsDocsComponents from "@trueberryless-org/starlight-plugins-docs-components";

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
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
        de: {
          label: "Deutsch",
          lang: "de",
        },
      },
      plugins: [
        starlightViewModes({
          zenModeSettings: {
            enabled: true,
            // closeButtonPosition: "top-right",
            displayOptions: {
              showHeader: false,
              showSidebar: true,
              showTableOfContents: false,
              showFooter: true,
            },
            // switchVisibility: {
            //   location: ["tableOfContents", "header", "headerMobile"],
            // },
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
        // starlightPluginsDocsComponents({
        //   pluginName: "starlight-view-modes",
        //   showcaseProps: {
        //     entries: [],
        //   },
        // }),
      ],
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Getting Started", link: "/getting-started/" },
            { label: "Configuration", link: "/configuration/" },
          ],
        },
        { label: "Demo", link: "/demo/" },
      ],
      credits: true,
    }),
  ],
  adapter: node({
    mode: "standalone",
  }),
});
