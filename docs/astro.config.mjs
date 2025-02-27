import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import starlightViewModes from "starlight-view-modes";
import starlightImageZoom from "starlight-image-zoom";
import starlightPluginShowLatestVersion from "starlight-plugin-show-latest-version";

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
            tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
            plugins: [
                starlightViewModes({
									zenModeSettings: {
										enabled: true,
										closeButtonPosition: "top-right",
										displayOptions: {
											showHeader: true,
											showSidebar: true,
											showTableOfContents: false,
											showFooter: false,
										},
										switchVisibility: {
											location: ["tableOfContents", "header", "headerMobile"],
										},
									},
                }),
                starlightImageZoom(),
								starlightPluginShowLatestVersion({
									repo: "trueberryless/starlight-view-modes",
								}),
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
