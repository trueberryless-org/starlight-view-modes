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

export function ensureTrailingSlash(path: string): string {
  if (path.endsWith("/")) {
    return path;
  }

  return `${path}/`;
}

export const getUpdatedPath = (
  currentMode: string,
  currentPathname: string,
  mode: string
) => {
  const updatedPath =
    currentMode === mode
      ? currentPathname.replace(new RegExp(`^/${mode}`), "") || "/"
      : `/${mode}${currentPathname}`;

  return updatedPath;
};
