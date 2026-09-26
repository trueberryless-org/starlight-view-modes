const modifierKeys = ["ctrl", "shift", "alt"];

export function parseShortcut(shortcut: string, mode: string): Shortcut {
  const keys = shortcut.toLowerCase().split("+");

  return {
    keys: keys.filter((key) => !modifierKeys.includes(key)),
    ctrl: keys.includes("ctrl"),
    shift: keys.includes("shift"),
    alt: keys.includes("alt"),
    mode,
  };
}

export function isShortcutPressed(
  event: KeyboardEvent,
  shortcut: Shortcut
): boolean {
  return (
    (shortcut.ctrl ? event.ctrlKey || event.metaKey : true) &&
    (shortcut.shift ? event.shiftKey : true) &&
    (shortcut.alt ? event.altKey : true) &&
    shortcut.keys.includes(event.key.toLowerCase())
  );
}

export interface Shortcut {
  keys: string[];
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  mode: string;
}
