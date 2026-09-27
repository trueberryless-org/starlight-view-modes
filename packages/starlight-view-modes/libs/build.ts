import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getSequenceCounts,
  getSequencePage,
  setSequenceCount,
} from "./sequence";

// The modes module cannot be imported from integration hooks as it depends on the plugin virtual modules.
const PresentationModeSegment = "presentation-mode";

// Adds the slide counts of their sequence to the built presentation pages.
export async function updatePresentationSequences(dir: URL): Promise<void> {
  const files = await getPresentationFiles(fileURLToPath(dir));
  const pages = await Promise.all(
    files.map(async (file) => {
      const html = await readFile(file, "utf8");

      return { file, html, page: getSequencePage(html) };
    })
  );
  const counts = getSequenceCounts(pages.flatMap(({ page }) => page ?? []));

  await Promise.all(
    pages.map(async ({ file, html, page }) => {
      const count = page && counts.get(page);
      if (!count) return;

      await writeFile(file, setSequenceCount(html, count));
    })
  );
}

async function getPresentationFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => join(entry.parentPath, entry.name))
    .filter((file) =>
      relative(dir, file).split(/[/\\]/).includes(PresentationModeSegment)
    );
}
