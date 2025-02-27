import type { StarlightRouteData } from "@astrojs/starlight/route-data";
import { stripLeadingSlash, stripTrailingSlash } from "./path";

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

  return currentSlug.startsWith(`${mode}/`);
}

export function getCurrentMode(
  currentSlug: string,
  sidebar: SidebarEntry[],
  pagination: PaginationLinks
): ViewMode {
  currentSlug = stripLeadingSlash(stripTrailingSlash(currentSlug));
  const isZenMode = isSpecificMode(currentSlug, sidebar, "zen-mode");

  if (isZenMode) {
    const zenSidebar = modifySidebar(sidebar, "/zen-mode", currentSlug);
    const zenPagination = modifyPagination(pagination, zenSidebar);
    return {
      mode: "zen-mode",
      sidebar: zenSidebar,
      pagination: zenPagination,
      isZenMode: true,
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
  prefix: string = "",
  currentSlug: string
): SidebarEntry[] {
  for (const entry of sidebar) {
    if (entry.type === "link") {
      entry.href = `${prefix}${entry.href}`;
      entry.isCurrent = entry.href.includes(currentSlug);
    }

    if (entry.type === "group") {
      entry.entries = modifySidebar(entry.entries, prefix, currentSlug);
    }
  }
  return sidebar;
}

function modifyPagination(
  pagination: PaginationLinks,
  sidebar: SidebarEntry[]
): PaginationLinks {
  const flattenedSidebar = flattenSidebar(sidebar);

  for (let i = 0; i < flattenedSidebar.length; i++) {
    const entry = flattenedSidebar[i]!;

    if (entry.isCurrent) {
      pagination.prev = flattenedSidebar[i - 1] || undefined;
      pagination.next = flattenedSidebar[i + 1] || undefined;
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

type SidebarEntry = StarlightRouteData["sidebar"][number];
type SidebarLink = Extract<SidebarEntry, { type: "link" }>;
type PaginationLinks = StarlightRouteData["pagination"];

export interface ViewMode {
  mode: "zen-mode" | "default";
  sidebar: SidebarEntry[];
  pagination: PaginationLinks;
  isZenMode?: boolean;
}
