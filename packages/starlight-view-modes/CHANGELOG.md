# starlight-view-modes

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
