import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import starlightZenMode from "starlight-zen-mode";

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: "Starlight Zen Mode",
            customCss: ["./src/styles/custom.css"],
            social: {
                github: "https://github.com/trueberryless/starlight-zen-mode",
            },
            editLink: {
                baseUrl: "https://github.com/trueberryless/starlight-zen-mode/edit/main/docs/",
            },
            plugins: [starlightZenMode()],
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
        }),
    ],
});
