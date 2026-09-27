import type { StarlightRouteData } from "@astrojs/starlight/route-data";

export const SequenceClassName = "starlight-view-modes-presentation-sequence";

const sequenceElementPattern = new RegExp(
  `<div class="${SequenceClassName}"[^>]*>`
);
const sequenceAttributePattern =
  /data-(sequence|sequence-index|slides)="([^"]*)"/g;

// The pages of a top-level sidebar group are presented as a sequence, e.g. the lessons of a course, with slide numbers
// counting the slides of all these pages.
export function getPresentationSequence(
  sidebar: SidebarEntry[],
  locale: string | undefined
): PresentationSequence | undefined {
  const groupIndex = sidebar.findIndex(
    (entry) =>
      entry.type === "group" &&
      getSidebarLinks(entry).some((link) => link.isCurrent)
  );
  const group = sidebar[groupIndex];
  if (!group) return undefined;

  return {
    id: `${locale ?? ""}/${groupIndex}`,
    index: getSidebarLinks(group).findIndex((link) => link.isCurrent),
  };
}

// Sequence slide counts are only known once all presentations are rendered, so they are added to the built pages.
export function getSequenceCounts(
  pages: SequencePage[]
): Map<SequencePage, SequenceCount> {
  const counts = new Map<SequencePage, SequenceCount>();
  const sequences = Map.groupBy(pages, (page) => page.id);

  for (const sequence of sequences.values()) {
    const sortedPages = sequence.toSorted((a, b) => a.index - b.index);
    const total = sortedPages.reduce((sum, page) => sum + page.slides, 0);
    let offset = 0;

    for (const page of sortedPages) {
      counts.set(page, { offset, total });
      offset += page.slides;
    }
  }

  return counts;
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
  if (!attributes["sequence"]) return undefined;

  return {
    id: attributes["sequence"],
    index: Number(attributes["sequence-index"]),
    slides: Number(attributes["slides"]),
  };
}

export function setSequenceCount(
  html: string,
  { offset, total }: SequenceCount
): string {
  return html.replace(sequenceElementPattern, (element) =>
    element.replace(/>$/, ` data-offset="${offset}" data-total="${total}">`)
  );
}

function getSidebarLinks(entry: SidebarEntry): SidebarLink[] {
  return entry.type === "link"
    ? [entry]
    : entry.entries.flatMap(getSidebarLinks);
}

type SidebarEntry = StarlightRouteData["sidebar"][number];
type SidebarLink = Extract<SidebarEntry, { type: "link" }>;

export interface PresentationSequence {
  id: string;
  index: number;
}

export interface SequencePage extends PresentationSequence {
  slides: number;
}

export interface SequenceCount {
  offset: number;
  total: number;
}
