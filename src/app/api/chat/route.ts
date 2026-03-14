import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, vehicle, userContext } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Please provide a message" },
        { status: 400 }
      );
    }

    // Build system prompt with AI memory context
    let systemPrompt = `You are CarSource AI's expert automotive modification assistant. You specialize in:
- Recommending the best mods for specific vehicles
- Explaining what each modification does and its real-world gains
- Build path advice (what order to install mods)
- Compatibility warnings between parts
- Brand comparisons
- Install difficulty and tips
- Tuning advice
- Safety considerations

Be specific, use real brand names, and give accurate HP/torque numbers. Be enthusiastic about cars but also practical about budgets and safety.

${vehicle ? `The user is asking about: ${vehicle}` : ""}`;

    // Inject AI memory context if provided
    if (userContext) {
      systemPrompt += `\n\n${userContext}

Use this context to personalize your advice. Reference their specific vehicles, installed mods, and goals when relevant. If they have a budget range, keep recommendations within it. If they have preferred brands, prioritize those.`;
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
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
