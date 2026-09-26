---
"starlight-view-modes": patch
---

Fixes the `Search` component override rendering a copy of an older version of the Starlight `Search` component by now rendering the default Starlight `Search` component and only adding the view modes behavior on top of it.

If you have a custom `Search` component override in your Starlight project, make sure to render both the default Starlight `Search` component and the `starlight-view-modes/components/Search.astro` component, like for all other [component overrides](https://starlight-view-modes.netlify.app/getting-started/#component-overrides).
