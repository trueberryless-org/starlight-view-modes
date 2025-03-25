import type { StarlightRouteData } from "@astrojs/starlight/route-data";
import config from "virtual:starlight-view-modes-config";

import { getCurrentModeFromPath } from "./mode";
import { appendModePathname } from "./modeClient";
import { stripLeadingSlash, stripTrailingSlash } from "./path";
import { isExcludedPage } from "./utils";

export async function isSpecificMode(
  currentSlug: string,
  mode: string
): Promise<boolean> {
  return (await getCurrentModeFromPath(currentSlug)) === mode;
}

export async function modifySidebarAndPagination(
  starlightRoute: StarlightRouteData,
  currentSlug: string,
  sidebar: SidebarEntry[],
  pagination: PaginationLinks
): Promise<void> {
  currentSlug = stripLeadingSlash(stripTrailingSlash(currentSlug));
  const isZenMode = await isSpecificMode(currentSlug, "zen-mode");

  let currentMode = {
    mode: "default",
    sidebar,
    pagination,
  };

  if (isZenMode) {
    const zenSidebar = modifySidebar(sidebar, currentSlug, "zen-mode");
    const zenPagination = modifyPagination(pagination, zenSidebar, "zen-mode");
    currentMode = {
      mode: "zen-mode",
      sidebar: zenSidebar,
      pagination: zenPagination,
    };
  }

  starlightRoute.sidebar = currentMode.sidebar;
  starlightRoute.pagination = currentMode.pagination;
}

function modifySidebar(
  sidebar: SidebarEntry[],
  currentSlug: string,
  prefix: string = ""
): SidebarEntry[] {
  return sidebar
    .map((entry) => {
      if (entry.type === "link") {
        if (isExcludedPage(entry.href, config.zenModeSettings.exclude)) {
          return null; // Remove excluded entry
        }

        // Skip modification if currentSlug matches the stripped prefix
        if (currentSlug !== stripLeadingSlash(stripTrailingSlash(prefix))) {
          entry.href = appendModePathname(entry.href, prefix);
          entry.isCurrent = entry.href.includes(currentSlug);
        }
      }

      if (entry.type === "group") {
        entry.entries = modifySidebar(entry.entries, currentSlug, prefix);
        if (entry.entries.length === 0) {
          return null; // Remove group if empty
        }
      }

      return entry;
    })
    .filter((entry) => entry !== null) as SidebarEntry[];
}

function modifyPagination(
  pagination: PaginationLinks,
  sidebar: SidebarEntry[],
  prefix: string = ""
): PaginationLinks {
  const flattenedSidebar = flattenSidebar(sidebar);

  function findNextValid(index: number): SidebarLink | undefined {
    if (index >= flattenedSidebar.length) return undefined;
    const entry = flattenedSidebar[index];
    return excludeLink(entry, config.zenModeSettings.exclude, prefix)
      ? findNextValid(index + 1)
      : entry;
  }

  function findPrevValid(index: number): SidebarLink | undefined {
    if (index < 0) return undefined;
    const entry = flattenedSidebar[index];
    return excludeLink(entry, config.zenModeSettings.exclude, prefix)
      ? findPrevValid(index - 1)
      : entry;
  }

  for (let i = 0; i < flattenedSidebar.length; i++) {
    const entry = flattenedSidebar[i]!;

    if (entry.isCurrent) {
      pagination.prev = findPrevValid(i - 1);
      pagination.next = findNextValid(i + 1);
      break;
    }
  }

  return pagination;
}

function flattenSidebar(sidebar: SidebarEntry[]): SidebarLink[] {
  return sidebar.flatMap((entry) =>
    entry.type === "group" ? flattenSidebar(entry.entries) : entry
  );
}

function excludeLink(
  link: SidebarLink | undefined,
  exclude: string[],
  prefix: string = ""
): boolean {
  return isExcludedPage(
    stripLeadingSlash(stripTrailingSlash(link?.href || "")),
    exclude.map((e) =>
      stripLeadingSlash(appendModePathname(stripTrailingSlash(e), prefix))
    )
  );
}

type SidebarEntry = StarlightRouteData["sidebar"][number];
type SidebarLink = Extract<SidebarEntry, { type: "link" }>;
type PaginationLinks = StarlightRouteData["pagination"];
