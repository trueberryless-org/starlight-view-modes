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

### Zen mode

Here you can find all options regaring Zen mode.

#### `zenModeEnabled`

**Type:** `boolean`  
**Default:** `true`

Whether the Zen Mode Feature overall should be enabled or disabled.
Disabling this options is useful if a Zen Mode doesn't make much sense on your website.

#### `zenModeCloseButtonPosition`

**Type:** `enum`  
**Default:** `top-right`

When the Zen Mode is enabled the user is able to activate the Zen Mode. When activated, there is a button for deactivating the Zen Mode. This button can either be in any of the four corners of the website. This options lets you choose in which corner you want to place the button on your website.

There are these options:

-   `top-left`
-   `top-right`
-   `bottom-left`
-   `bottom-right`

#### `zenModeShowHeader`

**Type:** `boolean`  
**Default:** `false`

Wheter the header should be displayed when Zen mode is activated.

I recommend enabling this option of you want to give your users the opporunity to search whilst in Zen mode.

#### `zenModeShowSidebar`

**Type:** `boolean`  
**Default:** `false`

Wheter the sidebar should be displayed when Zen mode is activated.

I don't recommend enabling this option, but if you want feel free -- xD.

#### `zenModeShowTableOfContents`

**Type:** `boolean`  
**Default:** `true`

Wheter the table of contents should be displayed when Zen mode is activated.

I recommend enabling this option if the user should be able to navigate around on the current page.

I recommend disabling this option if you either want your users to have the full Zen mode experience, or if there are many anchor links on the page so that navigation isn't limited to the footer links.

#### `zenModeShowFooter`

**Type:** `boolean`  
**Default:** `true`

Whether the footer should be displayed when Zen mode is activated.
Disabling this option can mean that the user always has to leave Zen mode if they want to go the next or previous page because there are links to these pages in the footer.

I recommend disabling this option if you either want your users to have the full Zen mode experience, or if there are many anchor links on the page so that navigation isn't limited to the footer links.

## Recommendations

Personally, I think these settings will be the most pleasing to your users, so I just put them here for you to copy and paste if you like. Moreover, these are the default settings, so if you don't want to change anything, just follow [the default integration](/getting-started#installation) and you're good to go!

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
                    zenModeShowFooter: true,
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

:::note
I do not recommend enabling [`zenModeShowHeader`](#zenmodeshowheader), [`zenModeShowSidebar`](#zenmodeshowsidebar), [`zenModeShowTableOfContents`](#zenmodeshowtableofcontents) and [`zenModeShowFooter`](#zenmodeshowfooter) all at once, because this would mean that there is no Zen mode...
:::
