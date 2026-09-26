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
  await expect(page).toHaveURL("/lesson/#nested");
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
