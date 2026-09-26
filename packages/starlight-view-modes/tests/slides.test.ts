import { fromHtml } from "hast-util-from-html";
import { describe, expect, test } from "vitest";

import { getSlides } from "../libs/slides";

function deck(html: string, splitHeadingLevel = 3) {
  return getSlides(fromHtml(html, { fragment: true }), {
    description: "A description",
    splitHeadingLevel,
    title: "Title",
  });
}

function slides(html: string, splitHeadingLevel = 3) {
  return deck(html, splitHeadingLevel).stacks.flat();
}

function paragraph(sentences: number) {
  return `<p>${"Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(sentences)}</p>`;
}

function list(items: number, tagName = "ul", attributes = "") {
  return `<${tagName}${attributes}>${Array.from(
    { length: items },
    (_, index) => `<li>Item ${index + 1}</li>`
  ).join("")}</${tagName}>`;
}

function counter(value: string) {
  return `<span class="starlight-view-modes-presentation-counter">${value}</span>`;
}

describe("getSlides", () => {
  test("starts with a title slide including the description and a short introduction", () => {
    const [title, ...rest] = slides("<p>Short introduction.</p>");

    expect(title).toEqual({
      anchor: undefined,
      breadcrumbs: [],
      html: '<h1>Title</h1><p class="starlight-view-modes-presentation-description">A description</p><p>Short introduction.</p>',
      notes: undefined,
      outline: undefined,
      type: "title",
    });
    expect(rest).toEqual([]);
  });

  test("moves a long introduction to its own slides after the title slide", () => {
    const [title, intro] = slides(paragraph(8));

    expect(title?.html).not.toContain("Lorem");
    expect(intro).toMatchObject({
      breadcrumbs: ["Title"],
      html: paragraph(8),
    });
  });

  test("starts a new slide for each heading up to the split heading level", () => {
    const html = [
      '<h2 id="first">First</h2>',
      "<p>One</p>",
      '<h3 id="nested">Nested</h3>',
      "<p>Two</p>",
      '<h4 id="deep">Deep</h4>',
      "<p>Three</p>",
    ].join("");

    expect(slides(html).map(({ anchor }) => anchor)).toEqual([
      undefined,
      "first",
      "nested",
    ]);
    expect(slides(html, 2).map(({ anchor }) => anchor)).toEqual([
      undefined,
      "first",
    ]);
    expect(slides(html, 4).map(({ anchor }) => anchor)).toEqual([
      undefined,
      "first",
      "nested",
      "deep",
    ]);
  });

  test("keeps short nested sections on the slide of their parent section", () => {
    const [, section] = slides(
      '<h3 id="section">Section</h3><p>One</p><h4 id="detail">Detail</h4><p>Two</p>'
    );

    expect(section?.html).toBe(
      '<h3 id="section">Section</h3><p>One</p><h4 id="detail">Detail</h4><p>Two</p>'
    );
  });

  test("places nested sections not fitting on the slide of their parent section vertically below it", () => {
    const details = ["a", "b", "c", "d"]
      .map((id) => `<h4 id="${id}">${id.toUpperCase()}</h4>${paragraph(4)}`)
      .join("");
    const { stacks } = deck(
      `<h2 id="parent">Parent</h2><p>One</p><h3 id="section">Section</h3><p>Two</p>${details}`
    );
    const [section, ...rest] = stacks[2] ?? [];

    expect(stacks.map((stack) => stack.length)).toEqual([1, 1, 3]);
    expect(section?.html).toMatch(/^<h3 id="section">Section<\/h3>/);
    expect(rest.map(({ anchor, breadcrumbs, html }) => [anchor, breadcrumbs, html.slice(0, 15)])).toEqual([
      ["b", ["Title", "Parent", "Section"], '<h4 id="b">B</h'],
      ["d", ["Title", "Parent", "Section"], '<h4 id="d">D</h'],
    ]);
  });

  test("includes the headings of nested sections in the breadcrumbs of details", () => {
    const options = ["b", "c", "d", "e"]
      .map((id) => `<h5 id="${id}">${id.toUpperCase()}</h5>${paragraph(4)}`)
      .join("");
    const [, ...details] =
      deck(`<h3 id="section">Section</h3><h4 id="a">A</h4>${options}`).stacks[1] ?? [];

    expect(details.map(({ breadcrumbs }) => breadcrumbs)).toContainEqual([
      "Title",
      "Section",
      "A",
    ]);
  });

  test("places the slides of long sections horizontally", () => {
    const { stacks } = deck(
      `<h2 id="long">Long</h2>${paragraph(2).repeat(5)}`
    );

    expect(stacks.map((stack) => stack.length)).toEqual([1, 1, 1]);
  });



  test("returns breadcrumbs with the page title and the parent headings", () => {
    expect(
      slides(
        '<h2 id="a">A</h2><p>One</p><h3 id="b">B</h3><p>Two</p><h2 id="d">D</h2><p>Four</p>'
      ).map(({ breadcrumbs }) => breadcrumbs)
    ).toEqual([[], ["Title"], ["Title", "A"], ["Title"]]);
  });

  test("unwraps Starlight heading anchor links", () => {
    const [, section] = slides(
      '<div class="sl-heading-wrapper level-h2"><h2 id="heading">Heading</h2><a class="sl-anchor-link" href="#heading">Link</a></div><p>Content</p>'
    );

    expect(section?.html).toBe(
      `<h2 id="heading">Heading</h2><p>Content</p>`
    );
  });

  test("renders sections without content as dividers", () => {
    const [, divider, nested] = slides(
      '<h2 id="parent">Parent</h2><h3 id="child">Child</h3><p>Content</p>'
    );

    expect(divider).toMatchObject({ anchor: "parent", type: "divider" });
    expect(nested).toMatchObject({ anchor: "child", type: "statement" });
  });

  test("starts a new slide at thematic breaks and break directives", () => {
    const sections = slides(
      '<h2 id="heading">Heading</h2><p>One</p><hr><p>Two</p><!-- presentation: break --><p>Three</p>'
    ).slice(1);

    expect(sections.map(({ anchor, html }) => [anchor, html])).toEqual([
      [
        "heading",
        `<h2 id="heading">Heading${counter("1/3")}</h2><p>One</p>`,
      ],
      [
        "heading",
        `<h2>Heading${counter("2/3")}</h2><p>Two</p>`,
      ],
      [
        "heading",
        `<h2>Heading${counter("3/3")}</h2><p>Three</p>`,
      ],
    ]);
  });

  test("only numbers the slides of sections split into multiple slides", () => {
    const [, section] = slides('<h2 id="single">Single</h2><p>One</p>');

    expect(section?.html).not.toContain(counter("1/1"));
  });

  test("splits long sections into evenly filled slides", () => {
    const sections = slides(
      `<h2 id="long">Long</h2>${Array.from({ length: 5 }, () => paragraph(2)).join("")}`
    ).slice(1);

    expect(sections).toHaveLength(2);
    expect(sections.map(({ html }) => html.split("<p>").length - 1)).toEqual([
      3, 2,
    ]);
  });

  test("splits long ordered lists while preserving their numbering", () => {
    const sections = slides(
      `<h2 id="steps">Steps</h2>${list(14, "ol", ' class="sl-steps"')}`
    ).slice(1);

    expect(sections).toHaveLength(2);
    expect(sections[0]?.html).toContain('<ol class="sl-steps">');
    expect(sections[1]?.html).toContain(
      '<ol class="sl-steps" start="8" style="--sl-steps-start: 7">'
    );
  });

  test("keeps headings and lead-in paragraphs with the following block", () => {
    const sections = slides(
      `<h2 id="section">Section</h2>${paragraph(10)}<h4>Example</h4><p>Run the following command:</p>\n<pre><code>npm install\nnpm run build</code></pre>`
    ).slice(1);

    expect(sections).toHaveLength(2);
    expect(sections[1]?.html).toMatch(
      /^<h4>Example<\/h4><p>Run the following command:<\/p>\s*<pre>/
    );
  });

  test("avoids nearly empty slides by slightly shrinking content", () => {
    const code = Array.from({ length: 11 }, (_, index) => `line ${index}`).join("\n");
    const sections = slides(
      `<h2 id="section">Section</h2>${paragraph(4)}<p>Consider the following code:</p><pre><code>${code}</code></pre><p>Last sentence.</p>`
    ).slice(1);

    expect(sections).toHaveLength(2);
    expect(sections[1]?.html).toMatch(/<\/pre><p>Last sentence.<\/p>$/);
  });

  test("displays sparse single slide sections as statements", () => {
    const [, short, long] = slides(
      `<h2 id="short">Short</h2><p>One sentence.</p><h2 id="long">Long</h2>${paragraph(2).repeat(5)}`
    );

    expect(short?.type).toBe("statement");
    expect(long?.type).toBe("content");
  });

  test("splits long tables between rows while repeating the table head", () => {
    const rows = Array.from({ length: 12 }, (_, index) => `<tr><td>${index}</td></tr>`).join("");
    const sections = slides(
      `<h2 id="table">Table</h2><table><thead><tr><th>Head</th></tr></thead><tbody>${rows}</tbody></table>`
    ).slice(1);

    expect(sections).toHaveLength(2);
    for (const section of sections) {
      expect(section.html).toContain("<thead><tr><th>Head</th></tr></thead>");
    }
  });

  test("keeps blocks wrapped in keep directives on the same slide", () => {
    const intro = paragraph(2).repeat(2);
    const kept = paragraph(2).repeat(4);
    const count = (html: string) =>
      slides(html)
        .slice(1)
        .map(({ html }) => html.split("<p>").length - 1);

    expect(count(`<h2 id="kept">Kept</h2>${intro}${kept}`)).toEqual([3, 3]);
    expect(
      count(
        `<h2 id="kept">Kept</h2>${intro}<!-- presentation: keep start -->${kept}<!-- presentation: keep end -->`
      )
    ).toEqual([2, 4]);
  });

  test("hides content wrapped in hide directives", () => {
    const html = slides(
      '<h2 id="visible">Visible</h2><p>One</p><!-- presentation: hide start --><p>Hidden</p><h2 id="hidden">Hidden</h2><!-- presentation: hide end --><p>Two</p>'
    )
      .map(({ html }) => html)
      .join("");

    expect(html).not.toContain("Hidden");
    expect(html).toContain("<p>One</p><p>Two</p>");
  });

  test("ignores unknown directives and regular comments", () => {
    const [, section] = slides(
      '<h2 id="heading">Heading</h2><p>One</p><!-- presentation: unknown --><p>Two</p>'
    );

    expect(section?.html).toContain(
      "<p>One</p><!-- presentation: unknown --><p>Two</p>"
    );
  });

  test("extracts speaker notes", () => {
    const [, section] = slides(
      '<h2 id="notes">Notes</h2><p>Visible</p><aside class="starlight-view-modes-notes" hidden><p>Top-level</p></aside><ul><li>Item<aside class="starlight-view-modes-notes" hidden>Nested</aside></li></ul>'
    );

    expect(section?.html).toBe(
      `<h2 id="notes">Notes</h2><p>Visible</p><ul><li>Item</li></ul>`
    );
    expect(section?.notes).toBe("<p>Top-level</p>Nested");
  });

  test("ignores resources when estimating slide sizes", () => {
    const [, section] = slides(
      '<h2 id="code">Code</h2><link rel="stylesheet" href="/ec.css"><script type="module" src="/ec.js"></script><p>Content</p>'
    );

    expect(section?.type).toBe("statement");
    expect(section?.html).toContain('<link rel="stylesheet" href="/ec.css">');
  });

  test("returns an outline of the headings with the slide they start on", () => {
    const { outline } = deck(
      `<h2 id="a">A</h2>${Array.from({ length: 5 }, () => paragraph(2)).join("")}<h3 id="b">B</h3><p>One</p>`
    );

    expect(outline).toEqual([
      { anchor: "a", rank: 2, slide: 2, title: "A" },
      { anchor: "b", rank: 3, slide: 4, title: "B" },
    ]);
  });

  test("returns the same slides for the same content", () => {
    const html = `<h2 id="a">A</h2>${paragraph(20)}${list(30)}<h3 id="b">B</h3>${paragraph(4)}`;

    expect(deck(html)).toEqual(deck(html));
  });
});
