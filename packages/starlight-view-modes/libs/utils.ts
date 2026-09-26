import picomatch from "picomatch";
import context from "virtual:starlight-view-modes/context";

import { getLocaleFromSlug } from "./i18n";
import { AvailableModes } from "./modes";
import { insertSegment, stripLeadingSlash, stripTrailingSlash } from "./path";

const DefaultMode = "default";

export function isExcludedPage(path: string, exclude: string[]): boolean {
  return picomatch(exclude)(path);
}

export function handleIndexSlug(slug: string): string | undefined {
  if (slug === "") return undefined;
  if (["index", "/"].some((indexSlug) => slug.startsWith(indexSlug))) {
    return undefined;
  }

  return slug;
}

// Returns an identifier of a page independent of the view mode, index pages, and slashes, e.g. `guides/intro` for the
// `guides/intro/index` entry ID or the `/zen-mode/guides/intro/` pathname.
export function getPageKey(slug: string): string {
  const modes = AvailableModes.map((mode) => mode.name);

  return stripLeadingSlash(stripTrailingSlash(slug))
    .split("/")
    .filter((segment) => segment !== "index" && !modes.includes(segment))
    .join("/");
}

export function getPathnamePageKey(pathname: string): string {
  return getPageKey(stripSlugBase(stripLeadingSlash(pathname)));
}

export function insertModePathname(pathname: string, mode: string): string {
  if (mode === DefaultMode) return pathname;

  const locale = getLocaleFromSlug(pathname);
  const insertionPosition = getBaseSegments().length + (locale ? 1 : 0);

  return insertSegment(pathname, mode, insertionPosition);
}

export async function getCurrentModeFromPath(
  pathname: string
): Promise<string> {
  const slug = stripLeadingSlash(stripTrailingSlash(pathname));
  const locale = getLocaleFromSlug(slug);
  const slugWithoutBase = stripSlugBase(slug);
  const modeSlug = locale
    ? stripSlugPrefix(slugWithoutBase, locale)
    : slugWithoutBase;

  return (
    AvailableModes.find((mode) => modeSlug.startsWith(mode.name))?.name ??
    DefaultMode
  );
}

export async function getUpdatedModePathname(
  pathname: string,
  targetMode: string
): Promise<string> {
  const mode = stripLeadingSlash(stripTrailingSlash(targetMode));
  const currentMode = await getCurrentModeFromPath(pathname);

  if (currentMode === mode) return pathname;
  if (mode === DefaultMode)
    return removeModeFromPathname(pathname, currentMode);

  const cleanedPath =
    currentMode === DefaultMode
      ? pathname
      : removeModeFromPathname(pathname, currentMode, pathname.includes("/"));

  return insertModePathname(cleanedPath, mode);
}

function removeModeFromPathname(
  pathname: string,
  mode: string,
  withSlash = pathname.includes(`${mode}/`)
): string {
  return withSlash
    ? pathname.replace(`${mode}/`, "")
    : pathname.replace(mode, "");
}

function stripSlugBase(slug: string): string {
  const base = stripLeadingSlash(stripTrailingSlash(context.base));

  return base ? stripSlugPrefix(slug, base) : slug;
}

function stripSlugPrefix(slug: string, prefix: string): string {
  if (slug.startsWith(`${prefix}/`)) return slug.slice(prefix.length + 1);
  if (slug.startsWith(prefix)) return slug.slice(prefix.length);

  return slug;
}

function getBaseSegments(): string[] {
  return (context.base || "").split("/").filter(Boolean);
}
