import { describe, expect, test } from "vitest";

import { getDirective, getDirectiveHtml, getMdxDirective } from "../libs/directives";

describe("getDirective", () => {
  test("returns the directive of an HTML comment", () => {
    expect(getDirective(" presentation: break ")).toBe("break");
    expect(getDirective("presentation:keep start")).toBe("keep start");
    expect(getDirective(" presentation: unknown ")).toBeUndefined();
    expect(getDirective(" A regular comment ")).toBeUndefined();
  });
});

describe("getMdxDirective", () => {
  test("returns the directive of an MDX comment", () => {
    expect(getMdxDirective("/* presentation: hide start */")).toBe("hide start");
    expect(getMdxDirective(" /*presentation: hide end*/ ")).toBe("hide end");
    expect(getMdxDirective("/* A regular comment */")).toBeUndefined();
    expect(getMdxDirective('"presentation: break"')).toBeUndefined();
  });
});

describe("getDirectiveHtml", () => {
  test("renders a directive as a hidden HTML comment", () => {
    expect(getDirectiveHtml("break")).toBe("<p hidden><!-- presentation: break --></p>");
  });
});
