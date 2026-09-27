import { type Page, expect, test } from "@playwright/test";

async function gotoPresentation(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator("starlight-view-modes-presentation[data-ready]")).toBeAttached();
}

test("switches to the presentation of the current section and back", async ({
  page,
}) => {
  await page.goto("/lesson/#nested");
  await page.keyboard.press("Control+Shift+Y");


  await expect(page).toHaveURL("/presentation-mode/lesson/#nested");
  await expect(page.locator("starlight-view-modes-presentation[data-ready]")).toBeAttached();
  await expect(
    page.locator(".slides section.present:not(.stack) h3", { hasText: "Nested" })
  ).toBeVisible();
  await expect(page.locator(".slides section.present:not(.stack)")).not.toContainText(
    "Only visible in the documentation"
  );

  await page.keyboard.press("Control+Shift+Y");
  await expect(page).toHaveURL(/\/lesson\/?#nested$/);
});

test("navigates horizontally between sections and vertically into details", async ({
  page,
}) => {
  await gotoPresentation(page, "/presentation-mode/lesson/#nested");

  const breadcrumbs = page.getByRole("navigation", { name: "Breadcrumbs" });

  await expect(breadcrumbs).toHaveText("LessonBasics");

  await page.keyboard.press("ArrowDown");
  await expect(page).toHaveURL(
    /\/presentation-mode\/lesson\/#(setup|usage|troubleshooting)$/
  );
  await expect(breadcrumbs).toContainText("LessonBasicsNested");

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL("/presentation-mode/lesson/#code");
  await expect(breadcrumbs).toHaveText("Lesson");
});

test("shrinks slides overflowing the available space", async ({ page }) => {
  await gotoPresentation(page, "/presentation-mode/lesson/#code");

  const slide = page.locator(
    ".slides section.present:not(.stack) .starlight-view-modes-presentation-slide"
  );

  await expect(slide).toContainText("const value22");
  await expect(slide).toHaveAttribute("style", /--fit: 0\.\d+/);
  expect(
    await slide.evaluate((element) => element.scrollHeight <= element.clientHeight)
  ).toBe(true);
});

test("navigates between sections and pages using the contents", async ({
  page,
}) => {
  await gotoPresentation(page, "/presentation-mode/lesson/");

  const contents = page.getByRole("dialog", { name: "Contents" });

  await page.keyboard.press("m");
  await contents.getByRole("link", { name: "Code" }).click();
  await expect(contents).toBeHidden();
  await expect(page).toHaveURL("/presentation-mode/lesson/#code");

  await page.getByRole("button", { name: "Contents" }).click();
  await contents.getByRole("link", { name: "Homework" }).click();
  await expect(page).toHaveURL("/presentation-mode/homework/");
});

test("searches the site and opens the presentation of a result", async ({
  page,
}) => {
  await gotoPresentation(page, "/presentation-mode/lesson/");

  const search = page.getByRole("dialog", { name: "Search" });

  await page.getByRole("button", { name: "Search" }).click();
  await expect(search).toBeVisible();

  await page.keyboard.type("homework");
  await search.getByRole("link", { name: "Homework" }).first().click();
  await expect(page).toHaveURL(/\/presentation-mode\/homework\//);
});

async function getSlideNumber(page: Page) {
  const text = await page.locator(".slide-number").textContent();

  return text?.replace(/\s+/g, "").split("/").map(Number) ?? [];
}

test("continues the presentation on the next and previous pages of a sidebar group", async ({
  page,
}) => {
  await gotoPresentation(page, "/presentation-mode/lesson/");

  const [, total] = await getSlideNumber(page);

  await page.keyboard.press("End");
  await expect(page).toHaveURL("/presentation-mode/lesson/#code");
  const [last] = await getSlideNumber(page);

  // Fragments of the last slide are shown before continuing on the next page.
  await page.locator(".controls .navigate-right").click();
  await expect(page.locator(".fragment", { hasText: "Revealed step by step." })).toHaveClass(/\bvisible\b/);
  await expect(page).toHaveURL("/presentation-mode/lesson/#code");

  await page.locator(".controls .navigate-right").click();
  await expect(page).toHaveURL("/presentation-mode/homework/");
  await expect(page.locator("starlight-view-modes-presentation[data-ready]")).toBeAttached();
  expect(await getSlideNumber(page)).toEqual([(last ?? 0) + 1, total]);

  // Going back to the previous page displays its last slide with all its content.
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL("/presentation-mode/lesson/#code");
  await expect(page.locator("starlight-view-modes-presentation[data-ready]")).toBeAttached();
  expect(await getSlideNumber(page)).toEqual([last, total]);
  await expect(page.locator(".fragment", { hasText: "Revealed step by step." })).toHaveClass(/\bvisible\b/);
});

test("skips animations when going back", async ({ page }) => {
  await gotoPresentation(page, "/presentation-mode/lesson/#code");

  const fragment = page.locator(".fragment", { hasText: "Revealed step by step." });

  await page.keyboard.press("ArrowRight");
  await expect(fragment).toHaveClass(/\bvisible\b/);

  await page.keyboard.press("ArrowLeft");
  await expect(page).not.toHaveURL(/#code$/);
});

test("jumps to slides of all pages of a sidebar group", async ({ page }) => {
  await gotoPresentation(page, "/presentation-mode/homework/");

  const [first, total] = await getSlideNumber(page);
  const jump = page.getByRole("textbox", { name: "Jump to slide" });

  await page.keyboard.press("g");
  // The jump to slide field is displayed below the breadcrumbs.
  await expect(
    page.locator(".starlight-view-modes-presentation-header > nav + input")
  ).toBeVisible();
  await jump.fill("2");
  await jump.press("Enter");
  await expect(page).toHaveURL(/\/presentation-mode\/lesson\/#/);
  await expect(page.locator("starlight-view-modes-presentation[data-ready]")).toBeAttached();
  expect(await getSlideNumber(page)).toEqual([2, total]);

  await page.keyboard.press("g");
  await jump.fill(String(first));
  await jump.press("Enter");
  await expect(page).toHaveURL("/presentation-mode/homework/");
  await expect(page.locator("starlight-view-modes-presentation[data-ready]")).toBeAttached();
  expect(await getSlideNumber(page)).toEqual([first, total]);
});

test("leaves the presentation with Escape", async ({ page }) => {
  await gotoPresentation(page, "/presentation-mode/lesson/#nested");

  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/lesson\/?#nested$/);
});

test("switches to another view mode at the section being read", async ({ page }) => {
  await page.goto("/lesson/");
  await page.locator("#code").evaluate((heading) => heading.scrollIntoView());

  await page.getByRole("link", { name: "Switch to Presentation Mode" }).first().click();
  await expect(page).toHaveURL(/\/presentation-mode\/lesson\/?#code$/);

  await page.goto("/lesson/");
  await page.locator("#basics").evaluate((heading) => heading.scrollIntoView());
  await page.keyboard.press("Control+Shift+Y");
  await expect(page).toHaveURL(/\/presentation-mode\/lesson\/?#basics$/);
});

test("keeps the speaker view in sync with the presentation", async ({ context, page }) => {
  await gotoPresentation(page, "/presentation-mode/lesson/#basics");

  const [speakerView] = await Promise.all([context.waitForEvent("page"), page.keyboard.press("s")]);
  const notes = speakerView.locator(".speaker-controls-notes");
  const currentSlide = speakerView.frameLocator("#current-slide iframe");

  await expect(notes).toContainText("Remember to greet the class.");
  // Previews display the slides like the presentation, even in a speaker view taller than wide.
  await expect(currentSlide.locator(".reveal .slides")).toHaveCSS("width", "1280px");

  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#nested$/);
  await expect(notes).toBeHidden();

  // Going past the last slide in the speaker view continues the presentation, and its previews, on the next page.
  await page.keyboard.press("End");
  await expect(page).toHaveURL(/#code$/);
  await expect(currentSlide.locator(".slides section.present h2")).toContainText("Code");
  // The first key press shows the fragment of the last slide.
  await speakerView.keyboard.press("ArrowRight");
  await expect(currentSlide.locator(".fragment")).toHaveClass(/\bvisible\b/);
  await speakerView.keyboard.press("ArrowRight");
  await expect(page).toHaveURL("/presentation-mode/homework/");
  await expect(speakerView.locator("#current-slide iframe")).toHaveAttribute("src", /\/presentation-mode\/homework\//);
  await expect(currentSlide.locator(".slides section.present")).toContainText("Homework");
});
