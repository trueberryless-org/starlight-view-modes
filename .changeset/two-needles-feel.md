---
"starlight-view-modes": patch
---

Migrate to use SCSS internally. 

**⚠️ Potential breaking change**: If you were importing any styles from `"starlight-view-modes/styles/**/*.css"` you now need to update those imports to `"starlight-view-modes/styles/**/*.scss"` and follow [Astro's SCSS guide](https://docs.astro.build/en/guides/styling/#sass-and-scss).
