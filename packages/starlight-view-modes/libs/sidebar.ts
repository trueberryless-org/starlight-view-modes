import type { StarlightRouteData } from "@astrojs/starlight/route-data";

import { isExcludedPage } from "./exclude";
import { type AdditionalMode, AdditionalModes } from "./modes";
import { stripLeadingSlash, stripTrailingSlash } from "./path";
import { getCurrentModeFromPath, getModePages, hasModePage } from "./server";
import { getPathnamePageKey, insertModePathname } from "./utils";

export async function updateSidebarAndPagination(
  starlightRoute: StarlightRouteData
): Promise<void> {
  const mode = await getCurrentAdditionalMode(starlightRoute.id);
  if (!mode) return;

  const currentSlug = normalizeSlug(starlightRoute.id);
  const sidebar = getModeSidebar(starlightRoute.sidebar, {
    currentSlug,
    mode,
    pages: await getModePages(mode),
  });

  starlightRoute.sidebar = sidebar;
  starlightRoute.pagination = getModePagination(
    starlightRoute.pagination,
    sidebar,
    mode
  );
}

async function getCurrentAdditionalMode(
  id: string
): Promise<AdditionalMode | undefined> {
  const currentMode = await getCurrentModeFromPath(normalizeSlug(id));

  return AdditionalModes.find((mode) => mode.name === currentMode);
}

function getModeSidebar(
  sidebar: SidebarEntry[],
  options: ModeSidebarOptions
): SidebarEntry[] {
  return sidebar
    .map((entry) => getModeSidebarEntry(entry, options))
    .filter((entry): entry is SidebarEntry => entry !== undefined);
}

function getModeSidebarEntry(
  entry: SidebarEntry,
  options: ModeSidebarOptions
): SidebarEntry | undefined {
  if (entry.type === "group") {
    entry.entries = getModeSidebar(entry.entries, options);

    return entry.entries.length > 0 ? entry : undefined;
  }

  // External links are not part of the site.
  if (!entry.href.startsWith("/")) return entry;

  // Pages without a page in the current mode, e.g. excluded pages or pages injected by other plugins, are omitted.
  if (!hasModePage(options.pages, getPathnamePageKey(entry.href))) {
    return undefined;
  }

  entry.href = insertModePathname(entry.href, options.mode.name);
  entry.isCurrent = normalizeSlug(entry.href) === options.currentSlug;

  return entry;
}

function getModePagination(
  pagination: PaginationLinks,
  sidebar: SidebarEntry[],
  mode: AdditionalMode
): PaginationLinks {
  const links = flattenSidebar(sidebar);
  const currentIndex = links.findIndex((link) => link.isCurrent);

  if (currentIndex === -1) return pagination;

  return {
    prev: findValidLink(links.slice(0, currentIndex).reverse(), mode),
    next: findValidLink(links.slice(currentIndex + 1), mode),
  };
}

function findValidLink(
  links: SidebarLink[],
  mode: AdditionalMode
): SidebarLink | undefined {
  const exclude = mode.exclude.map((pattern) =>
    insertModePathname(normalizeSlug(pattern), mode.name)
  );

  return links.find(
    (link) => !isExcludedPage(normalizeSlug(link.href), exclude)
  );
}

function flattenSidebar(sidebar: SidebarEntry[]): SidebarLink[] {
  return sidebar.flatMap((entry) =>
    entry.type === "group" ? flattenSidebar(entry.entries) : entry
  );
}

function normalizeSlug(slug: string): string {
  return stripLeadingSlash(stripTrailingSlash(slug));
}

interface ModeSidebarOptions {
  currentSlug: string;
  mode: AdditionalMode;
  pages: Set<string>;
}

type SidebarEntry = StarlightRouteData["sidebar"][number];
type SidebarLink = Extract<SidebarEntry, { type: "link" }>;
type PaginationLinks = StarlightRouteData["pagination"];
