import context from "virtual:starlight-view-modes/context";

import { AdditionalModes } from "./modes";
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
  return AdditionalModes.filter((mode) => mode.enabled).flatMap(
    (mode) => mode.keyboardShortcut
  );
}

interface SearchData {
  mode: string;
  shortcuts: Shortcut[];
}
