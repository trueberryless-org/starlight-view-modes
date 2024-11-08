import type { StarlightViewModesConfig } from "./config";

export function getFileNameZenMode(displayOptions: StarlightViewModesConfig["zenModeSettings"]["displayOptions"]): string {
    const displayOptionsKey = getDisplayOptionsKey(displayOptions);

    switch (displayOptionsKey) {
        case "false-false-false-false":
            return "ZenMode";
        case "false-false-false-true":
            return "ZenModeFooter";
        case "false-false-true-false":
            return "ZenModeTableOfContents";
        case "false-false-true-true":
            return "ZenModeTableOfContentsFooter";
        case "false-true-false-false":
            return "ZenModeSidebar";
        case "false-true-false-true":
            return "ZenModeSidebarFooter";
        case "false-true-true-false":
            return "ZenModeSidebarTableOfContents";
        case "false-true-true-true":
            return "ZenModeSidebarTableOfContentsFooter";
        case "true-false-false-false":
            return "ZenModeHeader";
        case "true-false-false-true":
            return "ZenModeHeaderFooter";
        case "true-false-true-false":
            return "ZenModeHeaderTableOfContents";
        case "true-false-true-true":
            return "ZenModeHeaderTableOfContentsFooter";
        case "true-true-false-false":
            return "ZenModeHeaderSidebar";
        case "true-true-false-true":
            return "ZenModeHeaderSidebarFooter";
        case "true-true-true-false":
            return "ZenModeHeaderSidebarTableOfContents";
        case "true-true-true-true":
            return "ZenModeHeaderSidebarTableOfContentsFooter";
        default:
            return "ZenMode";
    }
}

function getDisplayOptionsKey(displayOptions: StarlightViewModesConfig["zenModeSettings"]["displayOptions"]): string {
    const { showHeader, showSidebar, showTableOfContents, showFooter } = displayOptions;
    return `${showHeader}-${showSidebar}-${showTableOfContents}-${showFooter}`;
}
