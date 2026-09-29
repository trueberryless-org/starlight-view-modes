import picomatch from "picomatch";

// Kept apart from `utils.ts` so that client scripts never load `picomatch`, a CommonJS dependency that Vite does not
// pre-bundle in development.
export function isExcludedPage(path: string, exclude: string[]): boolean {
  return picomatch(exclude)(path);
}
