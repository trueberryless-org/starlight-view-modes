import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, test } from "vitest";

import { updatePresentationSequences } from "../libs/build";

let dir: string | undefined;

afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true });
});

function getSequenceHtml(href: string, index: number) {
  return `<div class="starlight-view-modes-presentation-sequence" hidden data-href="${href}" data-sequence="/0" data-sequence-index="${index}" data-slides="3"></div>`;
}

describe("updatePresentationSequences", () => {
  test("adds the pages of their sequence to presentations built with the file build format", async () => {
    dir = await mkdtemp(join(tmpdir(), "starlight-view-modes-"));
    await mkdir(join(dir, "presentation-mode"));
    await writeFile(join(dir, "presentation-mode.html"), getSequenceHtml("/presentation-mode", 0));
    await writeFile(join(dir, "presentation-mode", "lesson.html"), getSequenceHtml("/presentation-mode/lesson", 1));
    await writeFile(join(dir, "lesson.html"), getSequenceHtml("/lesson", 2));

    await updatePresentationSequences(pathToFileURL(`${dir}/`));

    const pages =
      'data-pages="[{&quot;href&quot;:&quot;/presentation-mode&quot;,&quot;slides&quot;:3},{&quot;href&quot;:&quot;/presentation-mode/lesson&quot;,&quot;slides&quot;:3}]"';

    expect(await readFile(join(dir, "presentation-mode.html"), "utf8")).toContain(pages);
    expect(await readFile(join(dir, "presentation-mode", "lesson.html"), "utf8")).toContain(pages);
    expect(await readFile(join(dir, "lesson.html"), "utf8")).not.toContain("data-pages");
  });
});
