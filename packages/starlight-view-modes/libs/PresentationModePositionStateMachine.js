export class PresentationModePositionStateMachine {
  constructor(config, presentationModeOff) {
    this.config = config;
    this.presentationModeOff = presentationModeOff;
  }

  updatePosition() {
    this.setDynamicPosition();

    if (!window.matchMedia("(min-width: 50rem)").matches) {
      this.setBottomPosition();
    }
  }

  setDynamicPosition() {
    if (
      this.config.presentationModeCloseButtonPosition === "top-right" ||
      this.config.presentationModeCloseButtonPosition === "bottom-right"
    ) {
      this.presentationModeOff?.style.setProperty("right", "1rem");
      this.presentationModeOff?.style.removeProperty("left");
    } else {
      this.presentationModeOff?.style.setProperty("left", "1rem");
      this.presentationModeOff?.style.removeProperty("right");
    }

    if (
      this.config.presentationModeCloseButtonPosition === "top-right" ||
      this.config.presentationModeCloseButtonPosition === "top-left"
    ) {
      this.presentationModeOff?.style.setProperty("top", "1rem");
      this.presentationModeOff?.style.removeProperty("bottom");
    } else {
      this.presentationModeOff?.style.setProperty("bottom", "1rem");
      this.presentationModeOff?.style.removeProperty("top");
    }
  }

  setBottomPosition() {
    // Hier wird der Button immer unten fixiert, unabhängig von der top/bottom-Einstellung
    this.presentationModeOff?.style.setProperty("bottom", "1rem");
    this.presentationModeOff?.style.removeProperty("top"); // Entferne die top-Position, falls vorhanden

    // Position links oder rechts wird weiterhin basierend auf der config gesetzt
    if (
      this.config.presentationModeCloseButtonPosition === "top-right" ||
      this.config.presentationModeCloseButtonPosition === "bottom-right"
    ) {
      this.presentationModeOff?.style.setProperty("right", "1rem");
      this.presentationModeOff?.style.removeProperty("left"); // Entferne die left-Position, falls vorhanden
    } else {
      this.presentationModeOff?.style.setProperty("left", "1rem");
      this.presentationModeOff?.style.removeProperty("right"); // Entferne die right-Position, falls vorhanden
    }
  }

  setRightPosition() {
    // Hier wird der Button immer rechts fixiert, unabhängig von der left/right-Einstellung
    this.presentationModeOff?.style.setProperty("right", "1rem");
    this.presentationModeOff?.style.removeProperty("left"); // Entferne die left-Position, falls vorhanden

    // Position oben oder unten wird weiterhin basierend auf der config gesetzt
    if (
      this.config.presentationModeCloseButtonPosition === "top-right" ||
      this.config.presentationModeCloseButtonPosition === "top-left"
    ) {
      this.presentationModeOff?.style.setProperty("top", "1rem");
      this.presentationModeOff?.style.removeProperty("bottom"); // Entferne die bottom-Position, falls vorhanden
    } else {
      this.presentationModeOff?.style.setProperty("bottom", "1rem");
      this.presentationModeOff?.style.removeProperty("top"); // Entferne die top-Position, falls vorhanden
    }
  }

  setBottomRightPosition() {
    // Hier wird der Button immer unten fixiert, unabhängig von der top/bottom-Einstellung
    this.presentationModeOff?.style.setProperty("bottom", "1rem");
    this.presentationModeOff?.style.removeProperty("top"); // Entferne die top-Position, falls vorhanden

    // Hier wird der Button immer rechts fixiert, unabhängig von der left/right-Einstellung
    this.presentationModeOff?.style.setProperty("right", "1rem");
    this.presentationModeOff?.style.removeProperty("left"); // Entferne die left-Position, falls vorhanden
  }
}
