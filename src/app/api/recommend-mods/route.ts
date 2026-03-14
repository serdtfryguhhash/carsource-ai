import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { vehicle, budget, goals, currentMods } = await request.json();

    if (!vehicle) {
      return NextResponse.json(
        { error: "Please provide vehicle details" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: `You are an expert automotive modification advisor specializing in performance builds. You have deep knowledge of every popular mod platform, aftermarket brand, and build path.

Your job is to recommend the BEST modifications for a specific vehicle, considering the user's budget and goals. You know realistic HP/torque gains for every mod on every platform.

ALWAYS respond in this exact JSON format:
{
  "build_path": "Street Build" | "Track Build" | "Show Build" | "Balanced Daily" | "Off-Road Build",
  "summary": "2-3 sentence build summary",
  "recommendations": [
    {
      "priority": 1,
      "category": "ECU & Tuning",
      "mod_name": "COBB Accessport V3",
      "brand": "COBB",
      "estimated_cost": 650,
      "hp_gain": 40,
      "torque_gain": 40,
      "difficulty": "Bolt-On",
      "install_time": "30 minutes",
      "reason": "Best bang-for-buck first mod. Unlocks full potential of other bolt-ons.",
      "requires_tune": true
    }
  ],
  "total_cost": 5000,
  "total_hp_gain": 150,
  "total_torque_gain": 130,
  "estimated_final_hp": 418,
  "estimated_final_torque": 388,
  "warnings": ["Stage 2+ mods may void factory warranty", "Professional installation recommended for turbo upgrades"],
  "mod_order_tip": "Always start with a tune and intake before exhaust to maximize gains",
  "next_level": "For 400+ WHP, consider a larger turbo and built internals ($8,000-12,000)"
}

Be specific with real brand names, realistic prices, and accurate HP/torque numbers for the specific vehicle platform. Order recommendations by priority (best bang-for-buck first).`,
      messages: [
        {
          role: "user",
          content: `Recommend modifications for my vehicle:

Vehicle: ${vehicle}
Budget: ${budget || "Not specified - suggest a range of options"}
Goals: ${goals || "More power and better sound"}
${currentMods ? `Current Mods Already Installed: ${currentMods}` : "Currently stock"}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      try {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const recommendations = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ recommendations });
        }
      } catch {
        return NextResponse.json({ recommendations: { raw: content.text } });
      }
    }

    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Recommendation failed";
    console.error("Recommendation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "CarSource AI Advisor",
    hasKey: !!process.env.ANTHROPIC_API_KEY,
  });
}
