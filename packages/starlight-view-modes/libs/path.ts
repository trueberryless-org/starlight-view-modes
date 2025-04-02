/**
 * Removes the leading slash from a path if present.
 *
 * @param path - The path to modify.
 * @returns The path without a leading slash.
 */
export function stripLeadingSlash(path: string) {
  if (!path.startsWith("/")) {
    return path;
  }

  return path.slice(1);
}

/**
 * Removes the trailing slash from a path if present.
 *
 * @param path - The path to modify.
 * @returns The path without a trailing slash.
 */
export function stripTrailingSlash(path: string) {
  if (!path.endsWith("/")) {
    return path;
  }

  return path.slice(0, -1);
}

/**
 * Ensures a path has a leading slash.
 * If the path already starts with a slash, it is returned unchanged.
 *
 * @param path - The path to modify.
 * @returns The path with a leading slash.
 */
export function ensureLeadingSlash(path: string): string {
  if (path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
}

/**
 * Ensures a path has a trailing slash.
 * If the path already ends with a slash, it is returned unchanged.
 *
 * @param path - The path to modify.
 * @returns The path with a trailing slash.
 */
export function ensureTrailingSlash(path: string): string {
  if (path.endsWith("/")) {
    return path;
  }

  return `${path}/`;
}

/**
 * Normalizes a given path by:
 * - Collapsing multiple consecutive slashes into a single slash.
 * - Removing leading and trailing slashes.
 *
 * @param path - The path to normalize.
 * @returns The normalized path.
 */
export function normalizePath(path: string): string {
  return path.replace(/\/+/g, "/").replace(/^\/|\/$/g, "");
}

/**
 * Ensures a path has exactly one leading slash, removing extras.
 * If the path does not have a leading slash, one is added.
 *
 * @param path - The path to modify.
 * @returns The path with exactly one leading slash.
 */
export function trimToExactlyOneLeadingSlash(path: string): string {
  while (path.startsWith("/")) {
    path = path.slice(1);
  }

  return "/" + path;
}

/**
 * Inserts a segment into a path at a specified segment index.
 *
 * The index refers to the position within the path **split by slashes (`/`)**,
 * rather than a character index. The segment is inserted at the `nth` position
 * relative to the slashes, preserving leading and trailing slashes.
 *
 * @example
 * ```ts
 * insertSegment("/users/admin/profile", "settings", 2); // "/users/admin/settings/profile"
 * insertSegment("users/admin", "dashboard", 1); // "users/dashboard/admin"
 * insertSegment("/api", "v1", 0); // "/v1/api"
 * ```
 *
 * @param path - The original path to modify.
 * @param segment - The segment to insert.
 * @param position - The **segment index** (not character index) at which to insert.
 * @returns The modified path with the new segment inserted.
 */
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
    ); // Preserve empty strings at correct positions

  parts.splice(position, 0, segment); // Insert segment

  let result = parts.join("/");

  if (hasLeadingSlash) result = "/" + result;
  if (hasTrailingSlash) result += "/";

  return result;
}

/**
 * Checks if a given fullPath starts with a specified expectedPrefix,
 * ignoring leading and trailing slashes and collapsing consecutive slashes.
 *
 * @param fullPath - The full path or slug to check.
 * @param expectedPrefix - The prefix to compare against.
 * @returns `true` if `fullPath` starts with `expectedPrefix`, ignoring redundant slashes; otherwise, `false`.
 */
export function isSamePathStart(
  fullPath: string,
  expectedPrefix: string
): boolean {
  return normalizePath(fullPath).startsWith(normalizePath(expectedPrefix));
}

/**
 * Checks if a given fullPath ends with a specified expectedSuffix,
 * ignoring leading and trailing slashes and collapsing consecutive slashes.
 *
 * @param fullPath - The full path or slug to check.
 * @param expectedSuffix - The suffix to compare against.
 * @returns `true` if `fullPath` ends with `expectedSuffix`, ignoring redundant slashes; otherwise, `false`.
 */
export function isSamePathEnd(
  fullPath: string,
  expectedSuffix: string
): boolean {
  return normalizePath(fullPath).endsWith(normalizePath(expectedSuffix));
}
