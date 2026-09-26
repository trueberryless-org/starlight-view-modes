declare namespace App {
  interface Locals {
    starlightViewModes: import("./data").StarlightViewModesRouteData;
  }
}

declare namespace StarlightApp {
  type Translations = typeof import("./translations").Translations.en;
  interface I18n extends Translations {}
}
