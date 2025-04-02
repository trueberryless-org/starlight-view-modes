export const parseShortcut = (shortcut: string): Shortcut => {
  const keys = shortcut.toLowerCase().split("+");
  return {
    keys: keys.filter((k) => !["ctrl", "shift", "alt"].includes(k)),
    ctrl: keys.includes("ctrl"),
    shift: keys.includes("shift"),
    alt: keys.includes("alt"),
  };
};

export const isShortcutPressed = (e: KeyboardEvent, shortcut: Shortcut) => {
  return (
    (shortcut.ctrl ? e.ctrlKey || e.metaKey : true) &&
    (shortcut.shift ? e.shiftKey : true) &&
    (shortcut.alt ? e.altKey : true) &&
    shortcut.keys.includes(e.key.toLowerCase())
  );
};

export type Shortcut = {
  keys: string[];
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
};
