import { defineConfig, devices } from "@playwright/test";

const port = 4739;
const fixture = "tests/fixtures/presentation";

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: Boolean(process.env["CI"]),
  use: {
    baseURL: `http://localhost:${port}`,
    ...devices["Desktop Chrome"],
    viewport: { width: 1280, height: 800 },
  },
  webServer: {
    command: `pnpm --dir ${fixture} exec astro build && pnpm --dir ${fixture} exec astro preview --port ${port} --ignore-lock`,
    port,
    // Never reuse a server already running on the port, e.g. another local project.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
