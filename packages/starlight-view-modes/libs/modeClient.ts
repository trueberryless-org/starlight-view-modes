import astroConfig from "virtual:starlight-view-modes-context";

/**
 * Appends a mode to a pathname, respecting the base path configuration.
 * If the mode is 'default', the pathname is returned unchanged.
 *
 * @param {string} pathname - The pathname to append the mode to
 * @param {string} mode - The mode to append (e.g., 'dark', 'default')
 * @returns {string} - The pathname with the mode appended
 */
export function appendModePathname(pathname: string, mode: string) {
  // If the mode is default, return the pathname unchanged
  if (mode === "default") {
    return pathname;
  }

  const base = astroConfig?.base || "";

  // If base is empty, simply prepend the mode to the pathname
  if (base === "") {
    const hasLeadingSlash = pathname.startsWith("/");
    if (hasLeadingSlash) {
      return `/${mode}${pathname}`;
    } else {
      return `${mode}/${pathname}`;
    }
  }

  // If pathname starts with the base path
  if (pathname.startsWith(base)) {
    const pathWithoutBase = pathname.slice(base.length);
    return `${base}${mode}${pathWithoutBase}`;
  }

  // Handle case where pathname doesn't begin with the base path
  const hasLeadingSlash = pathname.startsWith("/");
  if (hasLeadingSlash) {
    return `/${mode}${pathname}`;
  } else {
    return `${mode}/${pathname}`;
  }
}

function insertSegment(path: string, segment: string, position: number) {
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
