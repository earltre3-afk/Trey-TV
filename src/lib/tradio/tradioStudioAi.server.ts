import { aiGenerateText, aiGenerateJson } from "../trey-i/aiProvider.server";

/**
 * AI backend for the embedded Tradio Studio (Tremix).
 *
 * Runs on Google Cloud (Vertex AI via ADC) through the shared Trey-I provider — NO Supabase.
 * Served from the custom server entry (src/server.ts) so it works in dev AND prod.
 *
 *   POST /api/tradio/ai
 *     { mode:"chat",  messages:[{role,content}], temperature? } -> { text, provider, model }
 *     { mode:"tasks", goal:string, project?:{...} }             -> { tasks:[{title,detail,category,priority}] }
 */

type ChatMsg = { role?: string; content?: string };

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, authorization",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export async function handleTradioStudioAi(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const body = (await request.json().catch(() => ({}))) as Record<string, any>;
  const mode = String(body.mode || "chat");

  try {
    if (mode === "tasks") {
      const goal = String(body.goal || "Finish my track");
      const project = body.project;
      const system =
        'You are a music-production planner. Return ONLY a JSON object of the shape ' +
        '{"tasks":[{"title":string,"detail":string,"category":"write"|"arrange"|"record"|"sound-design"|"mix"|"master"|"export"|"general","priority":1|2|3}]}. ' +
        "Give 5-8 concrete, ordered, actionable tasks. priority 1=high, 2=normal, 3=low.";
      const prompt = `Goal: ${goal}\nProject: ${project ? JSON.stringify(project) : "none"}\nReturn the JSON task plan.`;
      const data = await aiGenerateJson<{ tasks?: unknown[] }>({
        prompt,
        systemInstruction: system,
        temperature: 0.5,
        maxTokens: 2048,
        // No model "thinking" so the full token budget produces the JSON (avoids truncation).
        thinkingBudget: 0,
      } as any);
      return json({ tasks: Array.isArray(data?.tasks) ? data.tasks : [] });
    }

    // default: chat
    const messages: ChatMsg[] = Array.isArray(body.messages) ? body.messages : [];
    const system = messages
      .filter((m) => m.role === "system")
      .map((m) => String(m.content || ""))
      .join("\n\n");
    const convo = messages
      .filter((m) => m.role !== "system")
      .map(
        (m) =>
          `${m.role === "assistant" || m.role === "model" ? "Assistant" : "User"}: ${String(m.content || "")}`,
      )
      .join("\n");
    const temperature = Number(body.temperature ?? 0.4);

    // The Mix Engine / stem-FX / task functions ask for a JSON object and then JSON.parse the
    // returned text. Plain text generation can wrap JSON in prose/fences or truncate it, which
    // breaks parsing ("Gemini not working"). When JSON is requested, use the JSON generator
    // (responseMimeType=application/json) and return it as a clean string so JSON.parse succeeds.
    const wantsJson = /\bjson\b/i.test(system);
    if (wantsJson) {
      const obj = await aiGenerateJson<unknown>({
        prompt: convo || "Generate the requested JSON.",
        systemInstruction: system,
        temperature,
        maxTokens: 4096,
      });
      return json({ text: JSON.stringify(obj), provider: "vertex-adc", model: "gemini-2.5-flash" });
    }

    const { text } = await aiGenerateText({
      prompt: convo || "Hello",
      systemInstruction: system,
      temperature,
      maxTokens: 2048,
    });
    return json({ text, provider: "vertex-adc", model: "gemini-2.5-flash" });
  } catch (e: any) {
    return json({ error: e?.message || String(e) }, 500);
  }
}
