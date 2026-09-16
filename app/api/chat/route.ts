import { anthropic } from "@/lib/anthropic";
import { getIdeas } from "@/lib/ideas";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string"
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || !messages.every(isChatMessage)) {
    return new Response("Expected { messages: { role, content }[] }", {
      status: 400,
    });
  }
  if (messages.length === 0) {
    return new Response("messages must not be empty", { status: 400 });
  }

  // Keep the request bounded regardless of how long the client-side
  // conversation grows.
  const recentMessages = messages.slice(-20);

  const ideas = await getIdeas();
  const ideasSummary = ideas.length
    ? ideas
        .map(
          (idea, index) =>
            `${index + 1}. [${idea.category}] "${idea.title}" — ${idea.votes} vote${idea.votes === 1 ? "" : "s"}, submitted by ${idea.submitted_by}\n   ${idea.description}`
        )
        .join("\n\n")
    : "No ideas have been submitted yet.";

  const systemPrompt = `You are the Bank Ideas Assistant, built into an internal bank employee-innovation platform where staff submit and vote on ideas to improve the bank.

Current submitted ideas:
${ideasSummary}

You help employees with two things:
1. Authenticity & feasibility check: when asked about a specific idea, judge (a) whether it reads like generic AI-generated boilerplate (vague buzzwords, no concrete specifics, could apply to any company) versus a genuine, specific, human-written idea (concrete detail, a real pain point, a clear mechanism) — call this out plainly but note you're giving your best read, not a certainty; and (b) whether it's a realistic, actionable banking solution that could genuinely solve a real problem for customers or staff, versus something vague or impractical.
2. Voting guidance: when asked to compare ideas or help decide how to vote, rank the relevant ideas by uniqueness, specificity, and real-world impact for a bank, and briefly explain why — but always frame this as input to help a human decide, never as a decision you're making for them.

Keep answers concise (well under 200 words unless the user asks for more detail). Use plain text — no markdown headers, no bullet-point walls unless comparing multiple ideas. Be direct and specific, referencing idea titles by name.`;

  const stream = anthropic.messages.stream({
    model: "claude-opus-5",
    max_tokens: 1024,
    system: systemPrompt,
    messages: recentMessages,
    output_config: { effort: "medium" },
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("text", (text) => {
        controller.enqueue(encoder.encode(text));
      });
      stream.on("end", () => {
        controller.close();
      });
      stream.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
