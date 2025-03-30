import type { StarlightRouteData } from "@astrojs/starlight/route-data";
import config from "virtual:starlight-view-modes-config";

import { AdditionalModes } from "./definitions";
import { getLocalizedExclude } from "./i18n";
import { stripLeadingSlash, stripTrailingSlash } from "./path";
import { getCurrentModeFromPath } from "./server";
import { insertModePathname } from "./utils";
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

  let currentMode = {
    mode: "default",
    sidebar,
    pagination,
  };

  for (const mode of AdditionalModes) {
    const isSomeMode = await isSpecificMode(currentSlug, mode.name);

    if (isSomeMode) {
      const zenSidebar = modifySidebar(sidebar, currentSlug, mode.name);
      const zenPagination = modifyPagination(pagination, zenSidebar, mode.name);
      currentMode = {
        mode: mode.name,
        sidebar: zenSidebar,
        pagination: zenPagination,
      };
    }
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
        if (
          isExcludedPage(
            stripLeadingSlash(entry.href),
            getLocalizedExclude(config.zenModeSettings.exclude)
          )
        ) {
          return null; // Remove excluded entry
        }

        entry.href = insertModePathname(entry.href, prefix);
        entry.isCurrent =
          stripLeadingSlash(stripTrailingSlash(entry.href)) === currentSlug;
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
    return excludeLink(
      entry,
      getLocalizedExclude(config.zenModeSettings.exclude),
      prefix
    )
      ? findNextValid(index + 1)
      : entry;
  }

  function findPrevValid(index: number): SidebarLink | undefined {
    if (index < 0) return undefined;
    const entry = flattenedSidebar[index];
    return excludeLink(
      entry,
      getLocalizedExclude(config.zenModeSettings.exclude),
      prefix
    )
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
      insertModePathname(stripLeadingSlash(stripTrailingSlash(e)), prefix)
    )
  );
}

type SidebarEntry = StarlightRouteData["sidebar"][number];
type SidebarLink = Extract<SidebarEntry, { type: "link" }>;
type PaginationLinks = StarlightRouteData["pagination"];
