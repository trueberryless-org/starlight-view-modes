declare namespace App {
  type StarlightLocals = import("@astrojs/starlight").StarlightLocals;
  interface Locals extends StarlightLocals {
    /**
     * Starlight View Modes data.
     *
     * @see https://starlight-view-modes.trueberryless.org/view-modes-data/
     */
    starlightViewModes: import("./data").StarlightViewModesRouteData;
  }
}

declare namespace StarlightApp {
  type Translations = typeof import("./translations").Translations.en;
  interface I18n extends Translations {}
}
