import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import starlightViewModes from "starlight-view-modes";
import starlightImageZoom from "starlight-image-zoom";

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: "Starlight View Modes",
            customCss: ["./src/styles/custom.css"],
            social: {
                github: "https://github.com/trueberryless/starlight-view-modes",
            },
            editLink: {
                baseUrl: "https://github.com/trueberryless/starlight-view-modes/edit/main/docs/",
            },
            tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
            plugins: [
                starlightViewModes({
                    zenModeSettings: {
                        enabled: true,
                        closeButtonPosition: "top-right",
                        displayOptions: {
                            showHeader: false,
                            showSidebar: false,
                            showTableOfContents: false,
                            showFooter: false,
                        },
                        switchVisibility: {
                            location: ["tableOfContents", "header", "headerMobile"],
                        },
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
                    ],
                },
                {
                    label: "Resources",
                    autogenerate: { directory: "resources" },
                },
                { label: "Demo", link: "/demo/" },
            ],
            credits: true,
        }),
    ],
});
