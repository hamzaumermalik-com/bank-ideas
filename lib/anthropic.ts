import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.CLAUDE_API || process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing Claude API key. Set CLAUDE_API in .env.local (server-side only, never NEXT_PUBLIC_)."
  );
}

export const anthropic = new Anthropic({ apiKey });
