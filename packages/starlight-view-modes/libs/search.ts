import context from "virtual:starlight-view-modes/context";

import { ZenMode, getAdditionalMode } from "./modes";
import { getCurrentModeFromPath } from "./server";
import type { Shortcut } from "./shortcuts";

export async function getSearchData(pathname: string): Promise<SearchData> {
  return {
    mode: await getCurrentModeFromPath(pathname),
    shortcuts: getEnabledModeShortcuts(),
  };
}

export function isSearchEnabled(): boolean {
  return context.pagefind;
}

function getEnabledModeShortcuts(): Shortcut[] {
  const mode = getAdditionalMode(ZenMode);

  return mode?.enabled ? mode.keyboardShortcut : [];
}

interface SearchData {
  mode: string;
  shortcuts: Shortcut[];
}
