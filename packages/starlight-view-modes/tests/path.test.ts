import { describe, expect, test } from "vitest";
import { stripLeadingSlash, stripTrailingSlash, ensureLeadingSlash, ensureTrailingSlash, trimToExactlyOneLeadingSlash, insertSegment, isSamePathStart, isSamePathEnd, normalizePath } from "../libs/path";

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

describe("trimToExactlyOneLeadingSlash", () => {
  test("leave one leading slash", () => {
    expect(trimToExactlyOneLeadingSlash("/")).toBe("/");
    expect(trimToExactlyOneLeadingSlash("/test")).toBe("/test");
    expect(trimToExactlyOneLeadingSlash("/path/to/file")).toBe("/path/to/file");
  });

  test("remove multiple leading slashes", () => {
    expect(trimToExactlyOneLeadingSlash("//")).toBe("/");
    expect(trimToExactlyOneLeadingSlash("//test")).toBe("/test");
    expect(trimToExactlyOneLeadingSlash("//path/to/file")).toBe("/path/to/file");
    
    expect(trimToExactlyOneLeadingSlash("///test")).toBe("/test");
    expect(trimToExactlyOneLeadingSlash("////test")).toBe("/test");
    expect(trimToExactlyOneLeadingSlash("/////test")).toBe("/test");
  });

  test("adds one leading slash", () => {
    expect(trimToExactlyOneLeadingSlash("")).toBe("/");
    expect(trimToExactlyOneLeadingSlash("test")).toBe("/test");
    expect(trimToExactlyOneLeadingSlash("path/to/file")).toBe("/path/to/file");
  });
});

describe("normalizePath", () => {
  test("removes leading and trailing slashes", () => {
    expect(normalizePath("/test/path/")).toBe("test/path");
    expect(normalizePath("/a/b/c/")).toBe("a/b/c");
    expect(normalizePath("/only-leading")).toBe("only-leading");
    expect(normalizePath("only-trailing/")).toBe("only-trailing");
  });

  test("collapses multiple consecutive slashes", () => {
    expect(normalizePath("//test///path")).toBe("test/path");
    expect(normalizePath("///a//b///c//")).toBe("a/b/c");
    expect(normalizePath("a////b////c")).toBe("a/b/c");
  });

  test("handles empty string", () => {
    expect(normalizePath("")).toBe("");
  });

  test("handles only slashes", () => {
    expect(normalizePath("/")).toBe("");
    expect(normalizePath("//")).toBe("");
    expect(normalizePath("///")).toBe("");
    expect(normalizePath("/////")).toBe("");
  });

  test("handles already normalized paths", () => {
    expect(normalizePath("test/path")).toBe("test/path");
    expect(normalizePath("a/b/c")).toBe("a/b/c");
  });

  test("handles paths with a single segment", () => {
    expect(normalizePath("/test/")).toBe("test");
    expect(normalizePath("///test///")).toBe("test");
    expect(normalizePath("/////onlyOneSegment/////")).toBe("onlyOneSegment");
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

describe("isSamePathStart", () => {
  test("matches simple prefixes", () => {
    expect(isSamePathStart("/test/path", "/test")).toBe(true);
    expect(isSamePathStart("/a/b/c", "/a")).toBe(true);
  });

  test("ignores leading slashes", () => {
    expect(isSamePathStart("test/path", "/test")).toBe(true);
    expect(isSamePathStart("/test/path", "test")).toBe(true);
  });

  test("ignores trailing slashes", () => {
    expect(isSamePathStart("/test/path/", "/test")).toBe(true);
    expect(isSamePathStart("/a/b/c/", "/a")).toBe(true);
  });

  test("collapses multiple slashes", () => {
    expect(isSamePathStart("//test///path", "/test")).toBe(true);
    expect(isSamePathStart("///a//b/c", "/a")).toBe(true);
  });

  test("does not match substrings", () => {
    expect(isSamePathStart("/hello/world", "world")).toBe(false);
    expect(isSamePathStart("/abc/def", "bcd")).toBe(false);
  });

  test("handles empty strings", () => {
    expect(isSamePathStart("", "")).toBe(true);
    expect(isSamePathStart("/test", "")).toBe(true);
    expect(isSamePathStart("", "/test")).toBe(false);
  });
});

describe("isSamePathEnd", () => {
  test("matches simple suffixes", () => {
    expect(isSamePathEnd("/test/path", "path")).toBe(true);
    expect(isSamePathEnd("/a/b/c", "/c")).toBe(true);
  });

  test("ignores leading slashes", () => {
    expect(isSamePathEnd("test/path", "/path")).toBe(true);
    expect(isSamePathEnd("/test/path", "path")).toBe(true);
  });

  test("ignores trailing slashes", () => {
    expect(isSamePathEnd("/test/path/", "/path")).toBe(true);
    expect(isSamePathEnd("/a/b/c", "/c/")).toBe(true);
  });

  test("collapses multiple slashes", () => {
    expect(isSamePathEnd("/test///path//", "/path")).toBe(true);
    expect(isSamePathEnd("//a/b///c", "/c")).toBe(true);
  });

  test("does not match substrings", () => {
    expect(isSamePathEnd("/hello/world", "hello")).toBe(false);
    expect(isSamePathEnd("/abc/def", "cde")).toBe(false);
  });

  test("handles empty strings", () => {
    expect(isSamePathEnd("", "")).toBe(true);
    expect(isSamePathEnd("/test", "")).toBe(true);
    expect(isSamePathEnd("", "/test")).toBe(false);
  });
});
