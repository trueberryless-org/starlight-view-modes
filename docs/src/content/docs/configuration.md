---
title: Configuration
description: An overview of all the configuration options supported by the Starlight View Modes plugin.
tableOfContents:
  minHeadingLevel: 2
  maxHeadingLevel: 5
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

### `zenModeSettings`

**Type:** `boolean`  
**Default:** `true`

Here you can find all options regaring Zen mode.

#### `enabled`

**Type:** `boolean`  
**Default:** `true`

Whether the Zen Mode Feature overall should be enabled or disabled.
Disabling this options is useful if a Zen Mode doesn't make much sense on your website.

#### `displayOptions`

**Type:** 

```graphql
{ 
	showHeader: boolean, 
	showSidebar: boolean, 
	showTableOfContents: boolean, 
	showFooter: boolean 
}
```

**Default:**

```graphql
{
	showHeader: false,
	showSidebar: false,
	showTableOfContents: true,
	showFooter: true,
}
```

:::note
It is not possible to set all four `displayOptions` to `true` because this would look exactly like the normal mode.
:::

##### `showHeader`

**Type:** `boolean`  
**Default:** `false`

Wheter the header should be displayed when Zen mode is activated.

We recommend enabling this option of you want to give your users the opporunity to search whilst in Zen mode.

##### `showSidebar`

**Type:** `boolean`  
**Default:** `false`

Wheter the sidebar should be displayed when Zen mode is activated.

We don't recommend enabling this option, but if you want feel free -- xD.

##### `showTableOfContents`

**Type:** `boolean`  
**Default:** `true`

Wheter the table of contents should be displayed when Zen mode is activated.

We recommend enabling this option if the user should be able to navigate around on the current page.

We recommend disabling this option if you either want your users to have the full Zen mode experience, or if there are many anchor links on the page so that navigation isn't limited to the footer links.

##### `showFooter`

**Type:** `boolean`  
**Default:** `true`

Whether the footer should be displayed when Zen mode is activated.
Disabling this option can mean that the user always has to leave Zen mode if they want to go the next or previous page because there are links to these pages in the footer.

We recommend disabling this option if you either want your users to have the full Zen mode experience, or if there are many anchor links on the page so that navigation isn't limited to the footer links.

#### `exclude`

**Type:** `string[]`  
**Default:** `[]`

A list of pages or [glob patterns](https://github.com/micromatch/picomatch#globbing-features) that are not viewable in Zen mode.
