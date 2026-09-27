import type { StarlightRouteData } from "@astrojs/starlight/route-data";

export const SequenceClassName = "starlight-view-modes-presentation-sequence";

const sequenceElementPattern = new RegExp(
  `<div class="${SequenceClassName}"[^>]*>`
);
const sequenceAttributePattern =
  /data-(href|sequence|sequence-index|slides)="([^"]*)"/g;

// The pages of a top-level sidebar group are presented as a single presentation, e.g. the lessons of a course.
export function getPresentationSequence({
  locale,
  pagination,
  sidebar,
}: SequenceRoute): PresentationSequence | undefined {
  const groupIndex = sidebar.findIndex(
    (entry) =>
      entry.type === "group" &&
      getSidebarLinks(entry).some((link) => link.isCurrent)
  );
  const group = sidebar[groupIndex];
  if (!group) return undefined;

  const links = getSidebarLinks(group);
  const index = links.findIndex((link) => link.isCurrent);
  const hrefs = new Set(links.map((link) => link.href));
  const getGroupHref = (link: { href: string } | undefined) =>
    link && hrefs.has(link.href) ? link.href : undefined;

  return {
    href: links[index]?.href ?? "",
    id: `${locale ?? ""}/${groupIndex}`,
    index,
    next: getGroupHref(pagination.next),
    previous: getGroupHref(pagination.prev),
  };
}

// The slide counts of all pages of a sequence are only known once all presentations are rendered, so they are added
// to the built pages.
export function getSequencePages(
  pages: SequencePage[]
): Map<SequencePage, SequencePageSlides[]> {
  const sequences = new Map<SequencePage, SequencePageSlides[]>();

  for (const sequence of Map.groupBy(pages, (page) => page.id).values()) {
    const sequencePages = sequence
      .toSorted((a, b) => a.index - b.index)
      .map(({ href, slides }) => ({ href, slides }));

    for (const page of sequence) sequences.set(page, sequencePages);
  }

  return sequences;
}

export function getSequencePage(html: string): SequencePage | undefined {
  const element = sequenceElementPattern.exec(html)?.[0];
  if (!element) return undefined;

  const attributes = Object.fromEntries(
    [...element.matchAll(sequenceAttributePattern)].map(([, name, value]) => [
      name,
      value,
    ])
  );
  const { href, sequence, slides } = attributes;
  if (!href || !sequence || !slides) return undefined;

  return {
    href,
    id: sequence,
    index: Number(attributes["sequence-index"]),
    slides: Number(slides),
  };
}

export function setSequencePages(
  html: string,
  pages: SequencePageSlides[]
): string {
  const value = JSON.stringify(pages).replaceAll('"', "&quot;");

  return html.replace(sequenceElementPattern, (element) =>
    element.replace(/>$/, ` data-pages="${value}">`)
  );
}

function getSidebarLinks(entry: SidebarEntry): SidebarLink[] {
  return entry.type === "link"
    ? [entry]
    : entry.entries.flatMap(getSidebarLinks);
}

type SequenceRoute = Pick<
  StarlightRouteData,
  "locale" | "pagination" | "sidebar"
>;
type SidebarEntry = StarlightRouteData["sidebar"][number];
type SidebarLink = Extract<SidebarEntry, { type: "link" }>;

export interface PresentationSequence {
  href: string;
  id: string;
  index: number;
  /**
   * The next page of the sequence, if any, excluding pages following the sequence.
   */
  next: string | undefined;
  /**
   * The previous page of the sequence, if any, excluding pages preceding the sequence.
   */
  previous: string | undefined;
}

export interface SequencePage {
  href: string;
  id: string;
  index: number;
  slides: number;
}

export interface SequencePageSlides {
  href: string;
  slides: number;
}
