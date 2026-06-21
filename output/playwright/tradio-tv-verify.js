async (page) => {
  await page.goto("https://tv.treytrizzy.com/tradio?device=tv", {
    waitUntil: "domcontentloaded",
  });
  await page.getByText("Live Stations", { exact: true }).waitFor({
    state: "visible",
    timeout: 30_000,
  });

  const resources = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((entry) => entry.name),
  );

  return {
    href: page.url(),
    tvShellLoaded: resources.some((url) => url.includes("TVTradioApp")),
    mobileShellLoaded: resources.some((url) => url.includes("MobileTradioApp")),
    tvChunk: resources.find((url) => url.includes("TVTradioApp")) ?? null,
    mobileChunk: resources.find((url) => url.includes("MobileTradioApp")) ?? null,
  };
}
