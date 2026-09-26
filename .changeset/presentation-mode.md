---
"starlight-view-modes": minor
---

Adds a new Presentation Mode, enabled by default, to present any page of your documentation as a slide deck powered by [reveal.js](https://revealjs.com/).

Slides are generated automatically and deterministically from the page content, with breadcrumbs, numbered headings for sections spanning multiple slides, vertical slides for the details of sections, and nearly empty slides avoided by favoring slightly scaled down content. Presentation directives can be used to [control how content is split into slides](https://starlight-view-modes.netlify.app/presentations/#controlling-slides), a new [`<SpeakerNotes>`](https://starlight-view-modes.netlify.app/presentations/#speaker-notes) component can be used to add speaker notes, and the new [`presentationModeSettings`](https://starlight-view-modes.netlify.app/configuration/#presentationmodesettings) configuration option can be used to customize or disable Presentation Mode.

To disable Presentation Mode, set the `presentationModeSettings.enabled` option to `false`:

```js
starlightViewModes({
  presentationModeSettings: {
    enabled: false,
  },
}),
```
