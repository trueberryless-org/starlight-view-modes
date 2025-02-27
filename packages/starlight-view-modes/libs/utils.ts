import type { StarlightViewModesConfig } from "./config";

export function getClassNameZenMode(
  displayOptions: StarlightViewModesConfig["zenModeSettings"]["displayOptions"]
): string {
  const displayOptionsKey = getDisplayOptionsKey(displayOptions);

  switch (displayOptionsKey) {
    case "false-false-false-false":
      return "zen-mode";
    case "false-false-false-true":
      return "zen-mode-footer";
    case "false-false-true-false":
      return "zen-mode-table-of-contents";
    case "false-false-true-true":
      return "zen-mode-table-of-contents-footer";
    case "false-true-false-false":
      return "zen-mode-sidebar";
    case "false-true-false-true":
      return "zen-mode-sidebar-footer";
    case "false-true-true-false":
      return "zen-mode-sidebar-table-of-contents";
    case "false-true-true-true":
      return "zen-mode-sidebar-table-of-contents-footer";
    case "true-false-false-false":
      return "zen-mode-header";
    case "true-false-false-true":
      return "zen-mode-header-footer";
    case "true-false-true-false":
      return "zen-mode-header-table-of-contents";
    case "true-false-true-true":
      return "zen-mode-header-table-of-contents-footer";
    case "true-true-false-false":
      return "zen-mode-header-sidebar";
    case "true-true-false-true":
      return "zen-mode-header-sidebar-footer";
    case "true-true-true-false":
      return "zen-mode-header-sidebar-table-of-contents";
    case "true-true-true-true":
      return "zen-mode-header-sidebar-table-of-contents-footer";
    default:
      return "ZenMode";
  }
}

function getDisplayOptionsKey(
  displayOptions: StarlightViewModesConfig["zenModeSettings"]["displayOptions"]
): string {
  const { showHeader, showSidebar, showTableOfContents, showFooter } =
    displayOptions;
  return `${showHeader}-${showSidebar}-${showTableOfContents}-${showFooter}`;
}
