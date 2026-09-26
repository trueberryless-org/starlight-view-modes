import type { StarlightRouteData } from "@astrojs/starlight/route-data";

import type { PageDescriptions } from "./presentationMode";
import { getPathnamePageKey } from "./utils";

// Flattens the sidebar into sections of pages labelled with the path of their groups to avoid deeply nested groups.
export function getContentsSections(
  sidebar: SidebarEntry[],
  descriptions: PageDescriptions,
  path: string[] = []
): ContentsSection[] {
  const pages = sidebar
    .filter((entry): entry is SidebarLink => entry.type === "link")
    .map((link) => ({
      attrs: link.attrs,
      description: descriptions[getPathnamePageKey(link.href)],
      href: link.href,
      isCurrent: link.isCurrent,
      label: link.label,
    }));
  const groups = sidebar.filter(
    (entry): entry is SidebarGroup => entry.type === "group"
  );

  return [
    ...(pages.length > 0 ? [{ path, pages }] : []),
    ...groups.flatMap((group) =>
      getContentsSections(group.entries, descriptions, [...path, group.label])
    ),
  ];
}

type SidebarEntry = StarlightRouteData["sidebar"][number];
type SidebarLink = Extract<SidebarEntry, { type: "link" }>;
type SidebarGroup = Extract<SidebarEntry, { type: "group" }>;

interface ContentsSection {
  path: string[];
  pages: {
    attrs: SidebarLink["attrs"];
    description: string | undefined;
    href: string;
    isCurrent: boolean;
    label: string;
  }[];
}
