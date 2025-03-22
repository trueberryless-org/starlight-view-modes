import { describe, expect, test } from "vitest";
import { stripLeadingSlash, stripTrailingSlash, ensureLeadingSlash, ensureTrailingSlash, insertSegment } from "../libs/path";

describe("stripLeadingSlash", () => {
  test("removes leading slash", () => {
    expect(stripLeadingSlash("/test")).toBe("test");
    expect(stripLeadingSlash("/path/to/file")).toBe("path/to/file");
  });

  test("returns same string if no leading slash", () => {
    expect(stripLeadingSlash("test")).toBe("test");
    expect(stripLeadingSlash("path/to/file")).toBe("path/to/file");
  });

  test("handles empty string", () => {
    expect(stripLeadingSlash("")).toBe("");
  });

  test("handles only a single slash", () => {
    expect(stripLeadingSlash("/")).toBe("");
  });

  test("handles multiple leading slashes", () => {
    expect(stripLeadingSlash("//test")).toBe("/test");
  });
});

describe("stripTrailingSlash", () => {
  test("removes trailing slash", () => {
    expect(stripTrailingSlash("test/")).toBe("test");
    expect(stripTrailingSlash("path/to/file/")).toBe("path/to/file");
  });

  test("returns same string if no trailing slash", () => {
    expect(stripTrailingSlash("test")).toBe("test");
    expect(stripTrailingSlash("path/to/file")).toBe("path/to/file");
  });

  test("handles empty string", () => {
    expect(stripTrailingSlash("")).toBe("");
  });

  test("handles only a single slash", () => {
    expect(stripTrailingSlash("/")).toBe("");
  });

  test("handles multiple trailing slashes", () => {
    expect(stripTrailingSlash("test//")).toBe("test/");
  });
});

describe("ensureLeadingSlash", () => {
  test("adds a leading slash if missing", () => {
    expect(ensureLeadingSlash("test")).toBe("/test");
    expect(ensureLeadingSlash("path/to/file")).toBe("/path/to/file");
  });

  test("keeps existing leading slash", () => {
    expect(ensureLeadingSlash("/test")).toBe("/test");
    expect(ensureLeadingSlash("/path/to/file")).toBe("/path/to/file");
  });

  test("handles empty string", () => {
    expect(ensureLeadingSlash("")).toBe("/");
  });

  test("handles multiple leading slashes", () => {
    expect(ensureLeadingSlash("//test")).toBe("//test");
  });
});

describe("ensureTrailingSlash", () => {
  test("adds a trailing slash if missing", () => {
    expect(ensureTrailingSlash("test")).toBe("test/");
    expect(ensureTrailingSlash("path/to/file")).toBe("path/to/file/");
  });

  test("keeps existing trailing slash", () => {
    expect(ensureTrailingSlash("test/")).toBe("test/");
    expect(ensureTrailingSlash("path/to/file/")).toBe("path/to/file/");
  });

  test("handles empty string", () => {
    expect(ensureTrailingSlash("")).toBe("/");
  });

  test("handles multiple trailing slashes", () => {
    expect(ensureTrailingSlash("test//")).toBe("test//");
  });
});

describe("insertSegment", () => {
  test("inserts segment at the beginning", () => {
    expect(insertSegment("/a/b/c/", "x", 0)).toBe("/x/a/b/c/");
    expect(insertSegment("/a/b/c", "x", 0)).toBe("/x/a/b/c");
    expect(insertSegment("a/b/c", "x", 0)).toBe("x/a/b/c");
  });

  test("inserts segment at the middle", () => {
    expect(insertSegment("/a/b/c", "x", 1)).toBe("/a/x/b/c");
    expect(insertSegment("a/b/c", "x", 1)).toBe("a/x/b/c");
  });

  test("inserts segment at the end", () => {
    expect(insertSegment("/a/b/c", "x", 3)).toBe("/a/b/c/x");
    expect(insertSegment("a/b/c", "x", 3)).toBe("a/b/c/x");
  });

  test("preserves leading slash", () => {
    expect(insertSegment("/a/b", "x", 1)).toBe("/a/x/b");
    expect(insertSegment("/a", "x", 1)).toBe("/a/x");
  });

  test("preserves trailing slash", () => {
    expect(insertSegment("a/b/", "x", 1)).toBe("a/x/b/");
    expect(insertSegment("/a/", "x", 1)).toBe("/a/x/");
  });

  test("handles empty path", () => {
    expect(insertSegment("", "x", 0)).toBe("x/");
    expect(insertSegment("/", "x", 0)).toBe("/x/");
  });

  test("handles out-of-bounds positions", () => {
    expect(insertSegment("a/b/c", "x", 10)).toBe("a/b/c/x");
    expect(insertSegment("/a/b/c/", "x", 10)).toBe("/a/b/c/x/");
  });

  test("handles negative positions", () => {
    expect(insertSegment("/a/b/c", "x", -1)).toBe("/a/b/x/c");
    expect(insertSegment("a/b/c", "x", -2)).toBe("a/x/b/c");
  });

  test("handles consecutive slashes", () => {
    expect(insertSegment("//a//b//", "x", 2)).toBe("/a/b/x/");
  });
});