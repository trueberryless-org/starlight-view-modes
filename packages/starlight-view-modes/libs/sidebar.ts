import type { StarlightRouteData } from "@astrojs/starlight/route-data";
import { stripLeadingSlash, stripTrailingSlash } from "./path";
import config from "virtual:starlight-view-modes-config";
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
      entry.href = `/${stripLeadingSlash(stripTrailingSlash(prefix))}${
        entry.href
      }`;
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

  for (let i = 0; i < flattenedSidebar.length; i++) {
    const entry = flattenedSidebar[i]!;

    const prev = flattenedSidebar[i - 1] ?? undefined;
    const next = flattenedSidebar[i + 1] ?? undefined;

    if (entry.isCurrent) {
      if (!excludePagination(prev, config.zenModeSettings.exclude, prefix)) {
        pagination.prev = prev;
      }
      if (!excludePagination(next, config.zenModeSettings.exclude, prefix)) {
        pagination.next = next;
      }
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
    exclude.map(
      (e) =>
        `${stripLeadingSlash(stripTrailingSlash(prefix))}/${stripLeadingSlash(
          stripTrailingSlash(e)
        )}`
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
