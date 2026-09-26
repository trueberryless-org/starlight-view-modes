import { describe, expect, test } from "vitest";

import { validateConfig } from "../libs/config";

describe("validateConfig", () => {
  test("returns the default configuration", () => {
    expect(validateConfig(undefined)).toEqual({
      zenModeSettings: {
        enabled: true,
        displayOptions: {
          showHeader: false,
          showSidebar: false,
          showTableOfContents: true,
          showFooter: true,
        },
        exclude: [],
        keyboardShortcut: [],
      },
    });
  });

  test("normalizes a single keyboard shortcut to a list", () => {
    expect(
      validateConfig({ zenModeSettings: { keyboardShortcut: "Ctrl+Shift+Z" } })
        .zenModeSettings.keyboardShortcut
    ).toEqual(["Ctrl+Shift+Z"]);
  });

  test("throws when all elements are displayed", () => {
    expect(() =>
      validateConfig({
        zenModeSettings: {
          displayOptions: {
            showHeader: true,
            showSidebar: true,
            showTableOfContents: true,
            showFooter: true,
          },
        },
      })
    ).toThrow(/At least one element must be hidden in Zen mode/);
  });

  test("throws with a readable error for an invalid keyboard shortcut", () => {
    expect(() =>
      validateConfig({ zenModeSettings: { keyboardShortcut: ["Ctrl+Enter"] } })
    ).toThrow(
      /Invalid starlight-view-modes configuration:[\s\S]*but you passed `Ctrl\+Enter`[\s\S]*zenModeSettings\.keyboardShortcut/
    );
  });
});
