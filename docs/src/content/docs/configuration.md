---
title: Configuration
description: An overview of all the configuration options supported by the Starlight View Modes plugin.
---

The Starlight View Modes plugin can be configured inside the `astro.config.mjs` configuration file of your project:

```js {11}
// astro.config.mjs
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightViewModes from "starlight-view-modes";

export default defineConfig({
    integrations: [
        starlight({
            plugins: [
                starlightViewModes({
                    // Configuration options go here.
                }),
            ],
            title: "My Docs",
        }),
    ],
});
```

## Configuration options

The Starlight View Modes plugin accepts the following configuration options:

### `zenModeEnabled`

**Type:** `boolean`  
**Default:** `true`

Whether the Zen Mode Feature overall should be enabled or disabled.
Disabling this options is useful if a Zen Mode doesn't make much sense on your website.

### `zenModeCloseButtonPosition`

**Type:** `enum`  
**Default:** `top-right`

When the Zen Mode is enabled the user is able to activate the Zen Mode. When activated, there is a button for deactivating the Zen Mode. This button can either be in any of the four corners of the website. This options lets you choose in which corner you want to place the button on your website.

There are these options:

-   `top-left`
-   `top-right`
-   `bottom-left`
-   `bottom-right`

## Recommendations

I personally think that these settings will be most pleased for your users, so I just put them here so you can copy and paste it if you want:

```js {11-14}
// astro.config.mjs
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import starlightViewModes from "starlight-view-modes";

export default defineConfig({
    integrations: [
        starlight({
            plugins: [
                starlightViewModes({
                    zenModeEnabled: true,
                    zenModeCloseButtonPosition: "top-right",
                    presentationModeEnabled: true, // not supported yet
                    presentationModeControlButtonPosition: "middle-right", // not supported yet
                }),
            ],
            title: "My Docs",
        }),
    ],
});
```

You can test exactly this configuartion on this whole website as you like.
