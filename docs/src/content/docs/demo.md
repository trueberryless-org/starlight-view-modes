---
title: Demo
description: Quam clipeum nubila Parnasi plangorem nunc adductis
---

## Where can I active the different modes now?

If you look in the right sidebar (Table of contents) you can probably spot the `Modes` heading where different modes can be activated. If you find the usability kinda hard and not intuitive, please let me know [here](https://github.com/trueberryless/starlight-view-modes/discussions/2). If you think the placement is already, let me also know about it [here](https://github.com/trueberryless/starlight-view-modes/discussions/2) because why not...

Currently only one mode is supported but stay tuned for more modes, like the `Presentation` mode for example.

## Configuration of this website

I personally think that these settings will be most pleased for your users, so I just put it here so you can copy and paste it if you want:

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
