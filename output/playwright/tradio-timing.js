async (page) => {
  await page.goBack({ waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: "Tradio", exact: true }).waitFor({
    state: "visible",
  });
  await page.waitForTimeout(1200);

  return page.evaluate(async () => {
    const link = document.querySelector('a[href="/tradio"]');
    if (!link) throw new Error("Tradio link missing");

    const start = performance.now();
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
          timeOrigin: performance.timeOrigin,
          href: location.href,
        };
      }
      await new Promise(requestAnimationFrame);
    }

    throw new Error("Tradio content timeout");
  });
}
