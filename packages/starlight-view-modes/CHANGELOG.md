# starlight-view-modes

## 0.12.0

### Minor Changes

- [#129](https://github.com/trueberryless-org/starlight-view-modes/pull/129) [`111a50a`](https://github.com/trueberryless-org/starlight-view-modes/commit/111a50a725b9fbea1d9dcab4935b610e5ed2d0aa) Thanks [@trueberryless](https://github.com/trueberryless)! - **⚠️ BREAKING CHANGE**: The minimum supported version of Starlight is now version `0.34.0`. But this time I really bump the peer dependency 😅

### Patch Changes

- [#131](https://github.com/trueberryless-org/starlight-view-modes/pull/131) [`59679cb`](https://github.com/trueberryless-org/starlight-view-modes/commit/59679cb355bd916c5bbe2339881af73e06254f49) Thanks [@trueberryless](https://github.com/trueberryless)! - Add view mode switcher near site title on mobile when header is disabled to prevent softlocking.

- [#129](https://github.com/trueberryless-org/starlight-view-modes/pull/129) [`111a50a`](https://github.com/trueberryless-org/starlight-view-modes/commit/111a50a725b9fbea1d9dcab4935b610e5ed2d0aa) Thanks [@trueberryless](https://github.com/trueberryless)! - **Internal refactoring**: Migrate to SCSS for better maintainability. Nothing changes for the consumer as the SCSS files are precompiled to CSS before publishing to avoid unnecessary dependencies.

- [#129](https://github.com/trueberryless-org/starlight-view-modes/pull/129) [`111a50a`](https://github.com/trueberryless-org/starlight-view-modes/commit/111a50a725b9fbea1d9dcab4935b610e5ed2d0aa) Thanks [@trueberryless](https://github.com/trueberryless)! - The minimum supported version of Starlight is now version `0.32.6` (surpassed by CSS layers changes anyway a.k.a. `0.34.0`) because internals got refectored to use the [new simplified `isFallback` passing type](https://github.com/withastro/starlight/pull/3030).

## 0.11.1

### Patch Changes

- [#122](https://github.com/trueberryless-org/starlight-view-modes/pull/122) [`2490bd7`](https://github.com/trueberryless-org/starlight-view-modes/commit/2490bd79bff5ec9dd08d6596ea5366af4db66568) Thanks [@trueberryless-org](https://github.com/apps/trueberryless-org)! - Setups trusted publishing using OpenID Connect (OIDC) authentication — no code changes.

## 0.11.0

### Minor Changes

- [#94](https://github.com/trueberryless-org/starlight-view-modes/pull/94) [`b29302d`](https://github.com/trueberryless-org/starlight-view-modes/commit/b29302dc5f40de8c5aa6582ea7b0c5b7da2075ab) Thanks [@trueberryless](https://github.com/trueberryless)! - ⚠️ **BREAKING CHANGE:** The minimum supported version of Starlight is now version `0.34.0`.

  Please use the `@astrojs/upgrade` command to upgrade your project:

  ```sh
  npx @astrojs/upgrade
  ```

- [#94](https://github.com/trueberryless-org/starlight-view-modes/pull/94) [`b29302d`](https://github.com/trueberryless-org/starlight-view-modes/commit/b29302dc5f40de8c5aa6582ea7b0c5b7da2075ab) Thanks [@trueberryless](https://github.com/trueberryless)! - Groups all of the Starlight View Modes plugin CSS declarations into a single `view-modes` [cascade layer](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers).

  This change aligns with the Starlight CSS architecture and allows for easier customization of the Starlight View Modes plugin CSS as any custom unlayered CSS will override the default styles. If you are using cascade layers in your custom CSS, you can use the [`@layer`](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) CSS at-rule to define the order of precedence for different layers including the ones used by Starlight and the Starlight View Modes plugin.

  Make sure to check your site’s appearance when upgrading to make sure there are no style regressions caused by this change.

### Patch Changes

- [#94](https://github.com/trueberryless-org/starlight-view-modes/pull/94) [`47604f7`](https://github.com/trueberryless-org/starlight-view-modes/commit/47604f7942e050a141502d74617a151118ae8404) Thanks [@trueberryless](https://github.com/trueberryless)! - Fix accessibility text for switch icons in the social icons and page title

- [#94](https://github.com/trueberryless-org/starlight-view-modes/pull/94) [`893b05b`](https://github.com/trueberryless-org/starlight-view-modes/commit/893b05bfc9fa6edd6d9cedb175f134e4884cc511) Thanks [@trueberryless](https://github.com/trueberryless)! - Fix Page Title grid column width for switching back to normal mode.

## 0.10.2

### Patch Changes

- [#76](https://github.com/trueberryless-org/starlight-view-modes/pull/76) [`02fd185`](https://github.com/trueberryless-org/starlight-view-modes/commit/02fd18535bba2c3b1021ff9579ff42e08cd589ab) Thanks [@trueberryless](https://github.com/trueberryless) and [@HiDeoo](https://github.com/HiDeoo)! - Make translations more flexible with specific switchTo fields for each mode

- [#76](https://github.com/trueberryless-org/starlight-view-modes/pull/76) [`a5dd659`](https://github.com/trueberryless-org/starlight-view-modes/commit/a5dd659832e9dd0e2b53c167729aac969eeace01) Thanks [@ztxone](https://github.com/ztxone)! - Add Russian UI translation

- [#74](https://github.com/trueberryless-org/starlight-view-modes/pull/74) [`3afd0ae`](https://github.com/trueberryless-org/starlight-view-modes/commit/3afd0ae4d12c33f64a478fd72fbc7af4c8601d62) Thanks [@ArmandPhilippot](https://github.com/ArmandPhilippot)! - Add French UI translation

- [#76](https://github.com/trueberryless-org/starlight-view-modes/pull/76) [`ed54f20`](https://github.com/trueberryless-org/starlight-view-modes/commit/ed54f20df8dd17e7f1bb8cea430da3727522ee1f) Thanks [@Waxer59](https://github.com/Waxer59)! - Add Spanish UI translation

- [#76](https://github.com/trueberryless-org/starlight-view-modes/pull/76) [`a5dd659`](https://github.com/trueberryless-org/starlight-view-modes/commit/a5dd659832e9dd0e2b53c167729aac969eeace01) Thanks [@NinuzIBZ](https://github.com/NinuzIBZ)! - Add Italien UI translation

- [#76](https://github.com/trueberryless-org/starlight-view-modes/pull/76) [`ed54f20`](https://github.com/trueberryless-org/starlight-view-modes/commit/ed54f20df8dd17e7f1bb8cea430da3727522ee1f) Thanks [@yanthomasdev](https://github.com/yanthomasdev)! - Add Portuguese UI translation

- [#76](https://github.com/trueberryless-org/starlight-view-modes/pull/76) [`aa3b925`](https://github.com/trueberryless-org/starlight-view-modes/commit/aa3b9252d941fe48d02636f73eb1390795203f86) Thanks [@jsparkdev](https://github.com/jsparkdev)! - Add Korean UI translation

- [#76](https://github.com/trueberryless-org/starlight-view-modes/pull/76) [`163d0d0`](https://github.com/trueberryless-org/starlight-view-modes/commit/163d0d0009ae28700bfd7c4410ad7a0abd9795d8) Thanks [@Nin3lee](https://github.com/Nin3lee)! - Add Chinese UI translation

## 0.10.1

### Patch Changes

- [#82](https://github.com/trueberryless-org/starlight-view-modes/pull/82) [`5ff48fa`](https://github.com/trueberryless-org/starlight-view-modes/commit/5ff48fac8c6ac5ef4c717b2c8ee1d77bf6179f52) Thanks [@trueberryless](https://github.com/trueberryless)! - Fix search results being undefined

## 0.10.0

### Minor Changes

- [#69](https://github.com/trueberryless-org/starlight-view-modes/pull/69) [`935ead3`](https://github.com/trueberryless-org/starlight-view-modes/commit/935ead36c5b5212bdc1bcbb058d1d2fbdbed4bf0) Thanks [@trueberryless](https://github.com/trueberryless)! - Add support for keyboard shortcuts to switch between modes

- [#64](https://github.com/trueberryless-org/starlight-view-modes/pull/64) [`71ae703`](https://github.com/trueberryless-org/starlight-view-modes/commit/71ae703f88d9e1a65e02822e67f68ce9b34e157a) Thanks [@trueberryless](https://github.com/trueberryless)! - Add support for [multilingual sites](https://starlight.astro.build/guides/i18n/).

## 0.9.0

### Minor Changes

- [#60](https://github.com/trueberryless-org/starlight-view-modes/pull/60) [`bc9eb6b`](https://github.com/trueberryless-org/starlight-view-modes/commit/bc9eb6b31f7f2b22ac52bdc95d28aa448df5141d) Thanks [@trueberryless](https://github.com/trueberryless)! - Adds a route data object accessible on Starlight pages using `Astro.locals.starlightViewModes` containing information about all the modes available on the current page. This can be useful to create custom view modes switchers or just access additional data about the view modes.

  See the [“View Modes Data” guide](https://starlight-view-modes.netlify.app/view-modes-data/) for more information.

### Patch Changes

- [#60](https://github.com/trueberryless-org/starlight-view-modes/pull/60) [`bc9eb6b`](https://github.com/trueberryless-org/starlight-view-modes/commit/bc9eb6b31f7f2b22ac52bdc95d28aa448df5141d) Thanks [@trueberryless](https://github.com/trueberryless)! - Fix sidebar showing elements that are excluded from mode

## 0.8.1

### Patch Changes

- [#53](https://github.com/trueberryless-org/starlight-view-modes/pull/53) [`3358d48`](https://github.com/trueberryless-org/starlight-view-modes/commit/3358d480efa95c4d5c9c91d33abd7e6a2f3c3292) Thanks [@trueberryless](https://github.com/trueberryless)! - Add support for Astro's [base option](https://docs.astro.build/en/reference/configuration-reference/#base)

## 0.8.0

Thanks to [@HiDeoo](https://github.com/HiDeoo) for reviewing the upgrade and overwork PR and ensuring everything works smoothly with no missing elements or logic! 🚀

### Minor Changes

- [#19](https://github.com/trueberryless-org/starlight-view-modes/pull/19) [`a16ce2e`](https://github.com/trueberryless-org/starlight-view-modes/commit/a16ce2ecafcdb557402b7390ae2531a84de03554) Thanks [@trueberryless](https://github.com/trueberryless)! - > ⚠️ **DISCLAIMER:** This plugin has been overworked completely and now works very different under the hoods. These has many benefits, like huge performance improvements because there is no more JavaScript, but there are still some things which are not supported in this release, namely **multilingual websites**.

  > If your website somehow configures the [`defaultLocale`](https://starlight.astro.build/reference/configuration/#defaultlocale) or [`locales` object](https://starlight.astro.build/reference/configuration/#locales) in any way, this plugin doesn't guarentee any support yet. This feature will hopefully be added in a future release.
  >
  > So please don't upgrade or temporarily disable this plugin if your website doesn't use the [`root` locale](https://starlight.astro.build/reference/configuration/#root-locale)!

- [#19](https://github.com/trueberryless-org/starlight-view-modes/pull/19) [`a16ce2e`](https://github.com/trueberryless-org/starlight-view-modes/commit/a16ce2ecafcdb557402b7390ae2531a84de03554) Thanks [@trueberryless](https://github.com/trueberryless)! - ⚠️ **BREAKING CHANGE:** The configuration options were completely built from the ground up, there is no backwards compability, please check out the [new configuration options](https://starlight-view-modes.trueberryless.org/configuration/).

- [#19](https://github.com/trueberryless-org/starlight-view-modes/pull/19) [`a16ce2e`](https://github.com/trueberryless-org/starlight-view-modes/commit/a16ce2ecafcdb557402b7390ae2531a84de03554) Thanks [@trueberryless](https://github.com/trueberryless)! - ⚠️ **BREAKING CHANGE:** The minimum supported version of Starlight is now version `0.32.0`.

  Please use the `@astrojs/upgrade` command to upgrade your project:

  ```sh
  npx @astrojs/upgrade
  ```
