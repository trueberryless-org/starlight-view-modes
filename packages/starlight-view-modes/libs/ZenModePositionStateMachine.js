export class ZenModePositionStateMachine {
    constructor(config, zenModeOff) {
        this.config = config;
        this.zenModeOff = zenModeOff;
    }

    updatePosition() {
        if (this.config.zenModeShowHeader === true && this.config.zenModeShowSidebar === false) {
            // Wenn Header angezeigt wird, soll der Button immer unten fixiert sein
            this.setBottomPosition();
        } else if (
            this.config.zenModeShowHeader === false &&
            this.config.zenModeShowSidebar === true
        ) {
            // Wenn Sidebar angezeigt wird, soll der Button immer rechts fixiert sein
            this.setRightPosition();
        } else if (
            this.config.zenModeShowHeader === true &&
            this.config.zenModeShowSidebar === true
        ) {
            // Wenn Header angezeigt wird, soll der Button immer unten fixiert sein
            // Wenn Sidebar angezeigt wird, soll der Button immer rechts fixiert sein
            this.setBottomRightPosition();
        } else {
            // Ansonsten normale Positionierungslogik basierend auf der Schaltfläche
            this.setDynamicPosition();
        }

        if (!window.matchMedia("(min-width: 50rem)").matches) {
            this.setBottomPosition();
        }
    }

    setDynamicPosition() {
        if (
            this.config.zenModeCloseButtonPosition === "top-right" ||
            this.config.zenModeCloseButtonPosition === "bottom-right"
        ) {
            this.zenModeOff?.style.setProperty("right", "1rem");
            this.zenModeOff?.style.removeProperty("left");
        } else {
            this.zenModeOff?.style.setProperty("left", "1rem");
            this.zenModeOff?.style.removeProperty("right");
        }

        if (
            this.config.zenModeCloseButtonPosition === "top-right" ||
            this.config.zenModeCloseButtonPosition === "top-left"
        ) {
            this.zenModeOff?.style.setProperty("top", "1rem");
            this.zenModeOff?.style.removeProperty("bottom");
        } else {
            this.zenModeOff?.style.setProperty("bottom", "1rem");
            this.zenModeOff?.style.removeProperty("top");
        }
    }

    setBottomPosition() {
        // Hier wird der Button immer unten fixiert, unabhängig von der top/bottom-Einstellung
        this.zenModeOff?.style.setProperty("bottom", "1rem");
        this.zenModeOff?.style.removeProperty("top"); // Entferne die top-Position, falls vorhanden

        // Position links oder rechts wird weiterhin basierend auf der config gesetzt
        if (
            this.config.zenModeCloseButtonPosition === "top-right" ||
            this.config.zenModeCloseButtonPosition === "bottom-right"
        ) {
            this.zenModeOff?.style.setProperty("right", "1rem");
            this.zenModeOff?.style.removeProperty("left"); // Entferne die left-Position, falls vorhanden
        } else {
            this.zenModeOff?.style.setProperty("left", "1rem");
            this.zenModeOff?.style.removeProperty("right"); // Entferne die right-Position, falls vorhanden
        }
    }

    setRightPosition() {
        // Hier wird der Button immer rechts fixiert, unabhängig von der left/right-Einstellung
        this.zenModeOff?.style.setProperty("right", "1rem");
        this.zenModeOff?.style.removeProperty("left"); // Entferne die left-Position, falls vorhanden

        // Position oben oder unten wird weiterhin basierend auf der config gesetzt
        if (
            this.config.zenModeCloseButtonPosition === "top-right" ||
            this.config.zenModeCloseButtonPosition === "top-left"
        ) {
            this.zenModeOff?.style.setProperty("top", "1rem");
            this.zenModeOff?.style.removeProperty("bottom"); // Entferne die bottom-Position, falls vorhanden
        } else {
            this.zenModeOff?.style.setProperty("bottom", "1rem");
            this.zenModeOff?.style.removeProperty("top"); // Entferne die top-Position, falls vorhanden
        }
    }

    setBottomRightPosition() {
        // Hier wird der Button immer unten fixiert, unabhängig von der top/bottom-Einstellung
        this.zenModeOff?.style.setProperty("bottom", "1rem");
        this.zenModeOff?.style.removeProperty("top"); // Entferne die top-Position, falls vorhanden

        // Hier wird der Button immer rechts fixiert, unabhängig von der left/right-Einstellung
        this.zenModeOff?.style.setProperty("right", "1rem");
        this.zenModeOff?.style.removeProperty("left"); // Entferne die left-Position, falls vorhanden
    }
}
