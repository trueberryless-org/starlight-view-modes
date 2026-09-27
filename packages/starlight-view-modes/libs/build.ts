import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  getSequencePage,
  getSequencePages,
  setSequencePages,
} from "./sequence";

// The modes module cannot be imported from integration hooks as it depends on the plugin virtual modules.
const PresentationModeSegment = "presentation-mode";

// Adds the pages of their sequence with their slide counts to the built presentation pages.
export async function updatePresentationSequences(dir: URL): Promise<void> {
  const files = await getPresentationFiles(fileURLToPath(dir));
  const pages = await Promise.all(
    files.map(async (file) => {
      const html = await readFile(file, "utf8");

      return { file, html, page: getSequencePage(html) };
    })
  );
  const sequences = getSequencePages(pages.flatMap(({ page }) => page ?? []));

  await Promise.all(
    pages.map(async ({ file, html, page }) => {
      const sequence = page && sequences.get(page);
      if (!sequence) return;

      await writeFile(file, setSequencePages(html, sequence));
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
