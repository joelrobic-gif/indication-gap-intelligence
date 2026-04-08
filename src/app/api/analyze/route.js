// Rate limiter (in-memory, per-instance)
const rateMap = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

function checkRate(request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const entry = rateMap.get(ip) || { count: 0, reset: now + WINDOW_MS };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + WINDOW_MS; }
  entry.count++;
  rateMap.set(ip, entry);
  return entry.count <= MAX_REQUESTS;
}

export async function POST(request) {
  if (!checkRate(request)) {
    return Response.json({ error: "Too many requests." }, { status: 429 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Analysis service not configured." }, { status: 503 });
  }

  try {
    const body = await request.json();

    // Validate messages array
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25_000);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: Math.min(Number(body.max_tokens) || 1200, 2000),
          system: body.system || "You are a pharmaceutical analysis system. Return ONLY valid JSON.",
          messages: body.messages.slice(-5),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Anthropic API error [${response.status}]:`, errorBody);
        return Response.json({ error: "Analysis service temporarily unavailable." }, { status: 502 });
      }

      const data = await response.json();
      return Response.json(data);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error("Analyze route error:", error);
    return Response.json({ error: "Analysis request failed." }, { status: 500 });
  }
}
