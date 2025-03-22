export function stripLeadingSlash(path: string) {
  if (!path.startsWith("/")) {
    return path;
  }

  return path.slice(1);
}

export function stripTrailingSlash(path: string) {
  if (!path.endsWith("/")) {
    return path;
  }

  return path.slice(0, -1);
}

export function ensureLeadingSlash(path: string): string {
  if (path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
}

export function ensureTrailingSlash(path: string): string {
  if (path.endsWith("/")) {
    return path;
  }

  return `${path}/`;
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
    ); // Preserve empty strings at correct positions

  parts.splice(position, 0, segment); // Insert segment

  let result = parts.join("/");

  if (hasLeadingSlash) result = "/" + result;
  if (hasTrailingSlash) result += "/";

  return result;
}
