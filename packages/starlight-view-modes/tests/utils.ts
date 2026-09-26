import { build } from "astro";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { vi } from "vitest";

export async function buildFixture(name: string) {
  const fixturePath = fileURLToPath(
    new URL(`fixtures/${name}/`, import.meta.url)
  );

  let output = "";
  let status: "success" | "error";

  function writeOutput(chunk: string | Uint8Array) {
    output += String(chunk);
    return true;
  }

  const stdoutWriteSpy = vi
    .spyOn(process.stdout, "write")
    .mockImplementation(writeOutput);
  const stderrWriteSpy = vi
    .spyOn(process.stderr, "write")
    .mockImplementation(writeOutput);

  try {
    await build({ root: fixturePath });
    status = "success";
  } catch {
    status = "error";
  }

  stderrWriteSpy.mockRestore();
  stdoutWriteSpy.mockRestore();

  return { output, status };
}

export function readFixtureOutput(name: string, path: string) {
  return readFileSync(
    fileURLToPath(new URL(`fixtures/${name}/dist/${path}`, import.meta.url)),
    "utf8"
  );
}
