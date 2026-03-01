import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, vehicle } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Please provide a message" },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are ModGarage's expert automotive modification assistant. You specialize in:
- Recommending the best mods for specific vehicles
- Explaining what each modification does and its real-world gains
- Build path advice (what order to install mods)
- Compatibility warnings between parts
- Brand comparisons
- Install difficulty and tips
- Tuning advice
- Safety considerations

Be specific, use real brand names, and give accurate HP/torque numbers. Be enthusiastic about cars but also practical about budgets and safety.

${vehicle ? `The user is asking about: ${vehicle}` : ""}`,
      messages: [{ role: "user", content: message }],
    });

    const content = response.content[0];
    if (content.type === "text") {
      return NextResponse.json({ reply: content.text });
    }

    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Chat failed";
    console.error("Chat error:", error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
