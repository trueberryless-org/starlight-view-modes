import { describe, expect, test } from "vitest";

import type { StarlightViewModesRouteData } from "../data";
import { resolveModeSwitch } from "../libs/switcher";

const defaultMode: StarlightViewModesRouteData["modes"][number] = {
  name: "default",
  title: "Normal Mode",
  switchToText: "Switch to normal mode",
  href: "/guides/intro/",
  isCurrent: false,
};

const zenMode: StarlightViewModesRouteData["modes"][number] = {
  name: "zen-mode",
  title: "Zen Mode",
  switchToText: "Switch to Zen Mode",
  href: "/zen-mode/guides/intro/",
  icon: "<path />",
  isCurrent: false,
  keyboardShortcuts: [],
};

describe("resolveModeSwitch", () => {
  test("links to the mode when it is not the current mode", () => {
    expect(resolveModeSwitch(zenMode, defaultMode)).toEqual({
      href: "/zen-mode/guides/intro/",
      icon: "<path />",
      keyboardShortcuts: [],
      name: "zen-mode",
      text: "Switch to Zen Mode",
    });
  });

  test("links to the default mode when it is the current mode", () => {
    expect(
      resolveModeSwitch({ ...zenMode, isCurrent: true }, defaultMode)
    ).toMatchObject({
      href: "/guides/intro/",
      text: "Switch to normal mode",
    });
  });
});
