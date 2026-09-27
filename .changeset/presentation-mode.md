---
"starlight-view-modes": minor
---

Adds a new [Presentation Mode](https://starlight-view-modes.netlify.app/presentation/) to present documentation pages as slide decks, configurable using the new [`presentationModeSettings`](https://starlight-view-modes.netlify.app/configuration/#presentationmodesettings) option.

To disable Presentation Mode, set the `presentationModeSettings.enabled` option to `false`:

```js
starlightViewModes({
  presentationModeSettings: {
    enabled: false,
  },
}),
```
