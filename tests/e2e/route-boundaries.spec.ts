import { expect, test, type Page } from "@playwright/test";

type BrowserIssues = ReturnType<typeof observeBrowserIssues>;

function observeBrowserIssues(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];
  const resourceErrors: string[] = [];
  const dataRequestCounts = new Map<string, number>();

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => {
    const failure = request.failure()?.errorText ?? "unknown failure";
    if (!failure.includes("ERR_ABORTED")) {
      failedRequests.push(`${request.method()} ${request.url()} (${failure})`);
    }
  });
  page.on("response", (response) => {
    if (
      response.status() >= 400 &&
      response.request().resourceType() !== "document"
    ) {
      resourceErrors.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.origin === "http://127.0.0.1:3100" &&
      url.pathname.startsWith("/api/") &&
      ["fetch", "xhr"].includes(request.resourceType())
    ) {
      const key = `${request.method()} ${url.pathname}${url.search}`;
      dataRequestCounts.set(key, (dataRequestCounts.get(key) ?? 0) + 1);
    }
  });

  return {
    consoleErrors,
    pageErrors,
    failedRequests,
    resourceErrors,
    dataRequestCounts,
  };
}

function expectNoBrowserIssues(
  issues: BrowserIssues,
  options: { allowDocument404?: boolean } = {},
) {
  const consoleErrors = options.allowDocument404
    ? issues.consoleErrors.filter(
        (message) =>
          message !==
          "Failed to load resource: the server responded with a status of 404 (Not Found)",
      )
    : issues.consoleErrors;
  expect(consoleErrors, "console.error output").toEqual([]);
  expect(issues.pageErrors, "uncaught page errors").toEqual([]);
  expect(issues.failedRequests, "failed browser requests").toEqual([]);
  expect(issues.resourceErrors, "HTTP errors for page resources").toEqual([]);
  expect(
    [...issues.dataRequestCounts].filter(([, count]) => count > 1),
    "duplicate browser data requests",
  ).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
}

async function expectAtlasReady(page: Page, projectName: string) {
  await expect(
    page.getByRole("region", { name: "2026 Formula 1 season atlas" }),
  ).toBeVisible();
  if (projectName === "desktop-chromium") {
    await expect(page.locator("canvas")).toBeVisible({ timeout: 30_000 });
  } else {
    await expect(
      page.getByText("WEBGL IS REQUIRED FOR THE LIVE GLOBE"),
    ).toBeVisible();
  }
  await page.waitForTimeout(500);
}

async function leaveAtlas(page: Page) {
  await page.goto("/schedule");
  await expect(
    page.getByRole("navigation", { name: "Season navigation" }),
  ).toBeVisible();
}

test("homepage owns the race pulse and F1 news dock", async ({ page }, testInfo) => {
  const issues = observeBrowserIssues(page);
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("navigation", { name: "主要导航" })).toBeVisible();
  await expect(page.locator('nav[aria-label="赛事快捷坞"]')).toHaveCount(1);
  await expect(page.getByText("赛事脉搏", { exact: true })).toHaveCount(1);
  await expect(page.getByText("F1 资讯", { exact: true })).toHaveCount(1);
  await expectNoHorizontalOverflow(page);

  if (testInfo.project.name === "mobile-chromium") {
    const dock = page.getByRole("navigation", { name: "赛事快捷坞" });
    await expect(dock).toBeVisible();
    await dock.getByRole("button", { name: "赛事脉搏" }).click();
    await expect(page.getByRole("region", { name: "赛事脉搏" })).toBeVisible();
    await page.getByRole("button", { name: "关闭赛事脉搏" }).click();
    await expect(page.getByRole("region", { name: "赛事脉搏" })).toHaveCount(0);
  }

  expectNoBrowserIssues(issues);
});

test("homepage to Atlas client navigation drops homepage-only content", async ({ page }, testInfo) => {
  const issues = observeBrowserIssues(page);
  await page.goto("/");
  await page.getByRole("link", { name: "探索 Atlas", exact: true }).click();

  await expect(page).toHaveURL(/\/atlas-v2$/);
  await expect(page.getByRole("navigation", { name: "赛事快捷坞" })).toHaveCount(0);
  await expect(page.getByText("赛事脉搏", { exact: true })).toHaveCount(0);
  await expect(page.getByText("F1 资讯", { exact: true })).toHaveCount(0);
  await expectAtlasReady(page, testInfo.project.name);
  await expectNoHorizontalOverflow(page);
  expectNoBrowserIssues(issues);
  await leaveAtlas(page);
  expectNoBrowserIssues(issues);
});

const secondaryRoutes = [
  { path: "/atlas-v2", landmarkRole: "region", landmark: "2026 Formula 1 season atlas" },
  { path: "/schedule", landmarkRole: "navigation", landmark: "Season navigation" },
  { path: "/races/2026/netherlands-gp-2026", landmarkRole: "navigation", landmark: "比赛站详情分区" },
] as const;

for (const route of secondaryRoutes) {
  test(`${route.path} excludes homepage-only content`, async ({ page }, testInfo) => {
    const issues = observeBrowserIssues(page);
    const response = await page.goto(route.path);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("navigation", { name: "赛事快捷坞" })).toHaveCount(0);
    await expect(page.getByText("赛事脉搏", { exact: true })).toHaveCount(0);
    await expect(page.getByText("F1 资讯", { exact: true })).toHaveCount(0);
    await expect(page.getByRole(route.landmarkRole, { name: route.landmark })).toBeVisible();
    if (route.path === "/atlas-v2") {
      await expectAtlasReady(page, testInfo.project.name);
    }
    await expectNoHorizontalOverflow(page);
    expectNoBrowserIssues(issues);
    if (route.path === "/atlas-v2") {
      await leaveAtlas(page);
      expectNoBrowserIssues(issues);
    }
  });
}

test("/race-weekend keeps the shared shell without homepage-only content", async ({ page }) => {
  const issues = observeBrowserIssues(page);
  const response = await page.goto("/race-weekend");

  expect(response?.status()).toBe(200);
  await expect(page.locator('nav[aria-label="主导航"]')).toHaveCount(1);
  await expect(page.locator('nav[aria-label="赛事快捷坞"]')).toHaveCount(0);
  await expect(page.getByText("赛事脉搏", { exact: true })).toHaveCount(0);
  await expect(page.getByText("F1 资讯", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "单站复盘" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expectNoBrowserIssues(issues);
});

const architectureRoutes = [
  { path: "/results", heading: "比赛结果" },
  { path: "/race-control", heading: "赛会控制" },
  { path: "/lap-analysis", heading: "圈速分析" },
  { path: "/weather", heading: "赛道天气" },
  { path: "/standings", heading: "积分榜" },
  { path: "/drivers", heading: "车手名录" },
  { path: "/project", heading: "项目记录" },
] as const;

for (const route of architectureRoutes) {
  test(`${route.path} uses the data-product shell without overflow`, async ({ page }) => {
    const issues = observeBrowserIssues(page);
    const response = await page.goto(route.path);

    expect(response?.status()).toBe(200);
    await expect(page.locator('nav[aria-label="主导航"]')).toHaveCount(1);
    await expect(page.getByRole("heading", { name: route.heading, exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expectNoBrowserIssues(issues);
  });
}

test("live route states its disconnected source without simulated-live language", async ({ page }) => {
  const issues = observeBrowserIssues(page);
  const response = await page.goto("/live");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "实时计时", exact: true })).toBeVisible();
  await expect(page.getByText("NOT LIVE · SOURCE NOT CONNECTED", { exact: true })).toBeVisible();
  await expect(page.getByText("AUTO REFRESH", { exact: true })).toHaveCount(0);
  await expect(page.getByText("MOCK FEED", { exact: true })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  expectNoBrowserIssues(issues);
});

test("data-product routes survive the mandated responsive widths", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One browser project covers the explicit viewport matrix.");
  test.setTimeout(180_000);
  const widths = [320, 375, 414, 768, 1280];
  const routes = ["/live", ...architectureRoutes.map((route) => route.path), "/race-weekend"];

  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} at ${width}px`).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();
      await expectNoHorizontalOverflow(page);

      const wrappedControls = await page.locator("a:visible, button:visible").evaluateAll((elements) =>
        elements.flatMap((element) => {
          const directTextNodes = [...element.childNodes].filter(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()
          );
          if (!directTextNodes.length) return [];
          const lineTops = new Set(directTextNodes.flatMap((node) => {
            const range = document.createRange();
            range.selectNodeContents(node);
            return [...range.getClientRects()].map((rect) => Math.round(rect.top));
          }));
          return lineTops.size > 1 ? [element.textContent?.trim() || element.getAttribute("aria-label") || element.tagName] : [];
        })
      );
      expect(wrappedControls, `${route} has wrapped clickable labels at ${width}px`).toEqual([]);
    }
  }
});

test("session tools collapse to one selector and one back action on a phone", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One browser project covers the explicit phone viewport.");
  await page.setViewportSize({ width: 375, height: 844 });

  for (const route of ["/results", "/race-control", "/lap-analysis", "/weather"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("[data-back-navigation]"), `${route} back controls`).toHaveCount(1);
    await expect(page.locator("[data-session-shortcuts]"), `${route} duplicate session strip`).toBeHidden();
    await expect(page.locator("select[name='session']"), `${route} session selector`).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

test("news keeps its own heading without inheriting the homepage dock", async ({ page }) => {
  const issues = observeBrowserIssues(page);
  const response = await page.goto("/news");

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("navigation", { name: "赛事快捷坞" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "资讯流" })).toBeVisible();
  await expect(page.getByText("LAPMETRY / F1 资讯", { exact: true })).toBeVisible();
  await expect(page.getByText("赛事脉搏", { exact: true })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  expectNoBrowserIssues(issues);
});

test("404 keeps shared navigation and excludes homepage-only content", async ({ page }) => {
  const issues = observeBrowserIssues(page);
  const response = await page.goto("/route-that-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page.locator('nav[aria-label="主导航"]')).toHaveCount(1);
  await expect(page.getByRole("link", { name: "LAPMETRY 首页" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "赛事快捷坞" })).toHaveCount(0);
  await expect(page.getByText("赛事脉搏", { exact: true })).toHaveCount(0);
  await expect(page.getByText("F1 资讯", { exact: true })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  expectNoBrowserIssues(issues, { allowDocument404: true });
});

test("event-detail 404 excludes homepage-only content", async ({ page }) => {
  const issues = observeBrowserIssues(page);
  const response = await page.goto("/races/2026/not-a-real-event");

  // App Router can stream a matched route before notFound() resolves, so the
  // document status may be 200 even though Next renders the 404 boundary.
  expect([200, 404]).toContain(response?.status());
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(page.locator('nav[aria-label="赛事快捷坞"]')).toHaveCount(0);
  await expect(page.getByText("赛事脉搏", { exact: true })).toHaveCount(0);
  await expect(page.getByText("F1 资讯", { exact: true })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  expectNoBrowserIssues(issues, { allowDocument404: true });
});

test("homepage remains usable with reduced motion", async ({ page }, testInfo) => {
  const issues = observeBrowserIssues(page);
  await page.emulateMedia({ reducedMotion: "reduce" });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("navigation", { name: "主要导航" })).toBeVisible();
  if (testInfo.project.name === "mobile-chromium") {
    const dock = page.getByRole("navigation", { name: "赛事快捷坞" });
    await expect(dock).toBeVisible();
    await dock.getByRole("button", { name: "赛事脉搏" }).click();
    await expect(page.getByRole("region", { name: "赛事脉搏" })).toBeVisible();
  }
  await expectNoHorizontalOverflow(page);
  expectNoBrowserIssues(issues);
});
