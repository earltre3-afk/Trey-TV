async (page) => {
  await page.goto("https://tv.treytrizzy.com/", {
    waitUntil: "domcontentloaded",
  });
  await page.getByRole("link", { name: "Tradio", exact: true }).waitFor({
    state: "visible",
  });

  return page.evaluate(async () => {
    const link = document.querySelector('a[href="/tradio"]');
    if (!link) throw new Error("Tradio link missing");

    const start = performance.now();
    const startingTimeOrigin = performance.timeOrigin;
    let routeAt = null;
    link.click();

    while (performance.now() - start < 10_000) {
      const elapsed = performance.now() - start;
      if (routeAt === null && location.pathname === "/tradio") {
        routeAt = elapsed;
      }
      if (document.body.innerText.includes("Song Wars")) {
        return {
          routeAt,
          contentAt: elapsed,
          sameDocument: startingTimeOrigin === performance.timeOrigin,
          href: location.href,
        };
      }
      await new Promise(requestAnimationFrame);
    }

    throw new Error("Tradio content timeout");
  });
}
