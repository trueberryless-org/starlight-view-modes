import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import starlightViewModes from "starlight-view-modes";
import starlightImageZoom from "starlight-image-zoom";

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: "Starlight Zen Mode",
            customCss: ["./src/styles/custom.css"],
            social: {
                github: "https://github.com/trueberryless/starlight-view-modes",
            },
            editLink: {
                baseUrl: "https://github.com/trueberryless/starlight-view-modes/edit/main/docs/",
            },
            plugins: [
                starlightViewModes({
                    zenModeEnabled: true,
                    zenModeCloseButtonPosition: "top-right",
                    presentationModeEnabled: false,
                    presentationModeControlButtonPosition: "middle-right",
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
                // {
                //     label: "Guides",
                //     items: [
                //         { label: "Ignoring Images", link: "/ignoring-images/" },
                //         { label: "Customization", link: "/customization/" },
                //     ],
                // },
                { label: "Demo", link: "/demo/" },
            ],
            credits: true,
        }),
    ],
});
