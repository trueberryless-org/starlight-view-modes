import type { StarlightRouteData } from "@astrojs/starlight/route-data";
import config from "virtual:starlight-view-modes-config";

import { appendModePathname } from "./modeClient";
import { stripLeadingSlash, stripTrailingSlash } from "./path";
import { isExcludedPage } from "./utils";

export function isSpecificMode(
  currentSlug: string,
  sidebar: SidebarEntry[],
  mode: string
): boolean {
  // If user has their own e.g. "zen-mode" page, it doesn't count as zen-mode,
  // because it's just the name of the page rather than a prefix.
  const hrefs = flattenSidebar(sidebar).map((entry) =>
    stripLeadingSlash(stripTrailingSlash(entry.href))
  );
  if (hrefs.some((href) => href.includes(currentSlug))) return false;

  return currentSlug.startsWith(`${mode}`);
}

export function getCurrentMode(
  currentSlug: string,
  sidebar: SidebarEntry[],
  pagination: PaginationLinks
): ViewMode {
  currentSlug = stripLeadingSlash(stripTrailingSlash(currentSlug));
  const isZenMode = isSpecificMode(currentSlug, sidebar, "zen-mode");

  if (isZenMode) {
    const zenSidebar = modifySidebar(sidebar, currentSlug, "zen-mode");
    const zenPagination = modifyPagination(pagination, zenSidebar, "zen-mode");
    return {
      mode: "zen-mode",
      sidebar: zenSidebar,
      pagination: zenPagination,
    };
  }

  return {
    mode: "default",
    sidebar,
    pagination,
  };
}

function modifySidebar(
  sidebar: SidebarEntry[],
  currentSlug: string,
  prefix: string = ""
): SidebarEntry[] {
  for (const entry of sidebar) {
    if (entry.type === "link") {
      if (currentSlug === stripLeadingSlash(stripTrailingSlash(prefix)))
        continue;
      entry.href = appendModePathname(entry.href, prefix);
      entry.isCurrent = entry.href.includes(currentSlug);
    }

    if (entry.type === "group") {
      entry.entries = modifySidebar(entry.entries, currentSlug, prefix);
    }
  }
  return sidebar;
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
    return excludePagination(entry, config.zenModeSettings.exclude, prefix)
      ? findNextValid(index + 1)
      : entry;
  }

  function findPrevValid(index: number): SidebarLink | undefined {
    if (index < 0) return undefined;
    const entry = flattenedSidebar[index];
    return excludePagination(entry, config.zenModeSettings.exclude, prefix)
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

function excludePagination(
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

export interface ViewMode {
  mode: "zen-mode" | "default";
  sidebar: SidebarEntry[];
  pagination: PaginationLinks;
}
