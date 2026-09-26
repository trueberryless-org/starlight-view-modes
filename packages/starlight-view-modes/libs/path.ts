const absoluteUrlPattern = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/;
const windowsPathPattern = /^[a-zA-Z]:\\/;

export function stripLeadingSlash(path: string) {
  if (!path.startsWith("/")) return path;

  return path.slice(1);
}

export function stripTrailingSlash(path: string) {
  if (!path.endsWith("/")) return path;

  return path.slice(0, -1);
}

export function ensureLeadingSlash(path: string): string {
  if (path.startsWith("/")) return path;

  return `/${path}`;
}

export function ensureTrailingSlash(path: string): string {
  if (path.endsWith("/")) return path;

  return `${path}/`;
}

export function normalizePath(path: string): string {
  return path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
}

export function trimToExactlyOneLeadingSlash(path: string): string {
  return `/${path.replace(/^\/+/, "")}`;
}

export function insertSegment(path: string, segment: string, position: number) {
  const hasLeadingSlash = path.startsWith("/");
  const hasTrailingSlash = path.endsWith("/");

  const parts = path
    .split("/")
    .filter(
      (part, index, arr) =>
        part !== "" ||
        (index === 0 && !hasLeadingSlash) ||
        (index === arr.length - 1 && !hasTrailingSlash)
    );

  parts.splice(position, 0, segment);

  const result = parts.join("/");

  return `${hasLeadingSlash ? "/" : ""}${result}${hasTrailingSlash ? "/" : ""}`;
}

export function isSamePathStart(
  fullPath: string,
  expectedPrefix: string
): boolean {
  return normalizePath(fullPath).startsWith(normalizePath(expectedPrefix));
}

export function isSamePathEnd(
  fullPath: string,
  expectedSuffix: string
): boolean {
  return normalizePath(fullPath).endsWith(normalizePath(expectedSuffix));
}

export function isAbsoluteUrl(url: string): boolean {
  return !windowsPathPattern.test(url) && absoluteUrlPattern.test(url);
}
