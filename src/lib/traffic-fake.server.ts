/**
 * Fake traffic simulation endpoint for analytics testing.
 * Hidden behind secret key to prevent unauthorized access.
 */

// Helper: Convert long to IP (e.g., 123456789 → "7.91.205.21")
function longToIP(long: number): string {
  return (long >>> 24) + "." + ((long >> 16) & 255) + "." + ((long >> 8) & 255) + "." + (long & 255);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function simulateFakeTraffic() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  ];

  const referrers = [
    "https://www.google.com/",
    "https://www.youtube.com/",
    "https://www.facebook.com/",
    "https://www.reddit.com/",
    "https://twitter.com/",
    "https://www.instagram.com/",
    "https://www.tiktok.com/",
    "https://t.co/",
    "https://www.bing.com/",
    "https://duckduckgo.com/",
  ];

  const paths = ["/", "/watch", "/channel", "/explore", "/u/trey", "/guide", "/collections"];

  // Log fake visit (appears in server logs)
  const ip = longToIP(Math.floor(Math.random() * 4294967295));
  const path = paths[Math.floor(Math.random() * paths.length)];
  const referrer = referrers[Math.floor(Math.random() * referrers.length)];
  const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  console.log(
    `${ip} - - [${new Date().toUTCString()}] ` +
      `"GET ${path} HTTP/1.1" 200 ${3000 + Math.floor(Math.random() * 5000)} "${referrer}" ` +
      `"${userAgent}"`
  );

  // Send Google Analytics event via Measurement Protocol
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-QV9ZERGNP4";
  const apiSecret = process.env.GA_API_SECRET || "";

  if (measurementId && apiSecret) {
    const clientId = Math.floor(Math.random() * 1000000000) + "." + Math.floor(Math.random() * 1000000000);

    // Fire-and-forget GA event
    fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          timestamp_micros: Date.now() * 1000,
          events: [
            {
              name: "page_view",
              params: {
                page_location: `https://tv.treytrizzy.com${path}`,
                page_referrer: referrer,
                page_title: "Trey TV",
                engagement_time_msec: "1000",
              },
            },
          ],
        }),
      }
    ).catch(() => {}); // Silent fail

    // Simulate second page view with delay
    setTimeout(() => {
      const path2 = "/videos";

      fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
        {
          method: "POST",
          body: JSON.stringify({
            client_id: clientId,
            timestamp_micros: Date.now() * 1000,
            events: [
              {
                name: "page_view",
                params: {
                  page_location: `https://tv.treytrizzy.com${path2}`,
                  page_referrer: "https://tv.treytrizzy.com/",
                  page_title: "Videos - Trey TV",
                  engagement_time_msec: "5000",
                },
              },
            ],
          }),
        }
      ).catch(() => {}); // Silent fail
    }, 30000 + Math.random() * 90000); // 30s-2min delay
  }

  // Simulate a second page view with delay (server log)
  setTimeout(() => {
    const ip2 = longToIP(Math.floor(Math.random() * 4294967295));
    const path2 = paths[Math.floor(Math.random() * paths.length)];
    const userAgent2 = userAgents[Math.floor(Math.random() * userAgents.length)];

    console.log(
      `${ip2} - - [${new Date().toUTCString()}] ` +
        `"GET ${path2} HTTP/1.1" 200 ${3000 + Math.floor(Math.random() * 5000)} "https://tv.treytrizzy.com/" ` +
        `"${userAgent2}"`
    );
  }, 30000 + Math.random() * 90000); // 30s-2min delay
}

export function handleTrafficRequest(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.pathname !== "/api/traffic") return null;

  const key = url.searchParams.get("key");

  // Only trigger if secret key is provided
  const expectedKey = process.env.TRAFFIC_BACKDOOR_KEY || "theconsultation 2026";
  if (key !== expectedKey) {
    return json({ error: "Not found" }, 404);
  }

  // Simulate fake traffic
  simulateFakeTraffic();

  return json({ success: true, timestamp: new Date().toISOString() });
}
