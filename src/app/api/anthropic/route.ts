/**
 * Anthropic API proxy for the trade-facing AI assistant.
 *
 * Mirrors the Mission Control prototype's `/api/anthropic` proxy so
 * both apps share the same access pattern (and can share the same
 * ANTHROPIC_API_KEY env var on Vercel — Greg's earlier confirmation).
 *
 * The client posts the full Anthropic /v1/messages payload (model,
 * messages, system, max_tokens, etc.) and this route forwards it
 * with the API key attached. Errors surface verbatim so config
 * issues (bad key, wrong model, etc.) are diagnosable in the chat
 * widget rather than silently failing.
 *
 * Next.js 16 App Router uses Web Fetch primitives (Request /
 * Response) — no @vercel/node dependency required.
 */

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 },
    );
  }
  try {
    const body = await req.json();
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    const data = await upstream.json();
    return Response.json(data, { status: upstream.status });
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error ? `Proxy request failed: ${e.message}` : "Proxy request failed",
      },
      { status: 500 },
    );
  }
}
