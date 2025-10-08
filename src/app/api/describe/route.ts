import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { selectedCity } = data;
    if (!selectedCity || typeof selectedCity !== "string") {
      return NextResponse.json({ error: "Selected city is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const prompt = `Напиши короткое, дружелюбное описание путешествия (80–120 слов) для города ${selectedCity}. Упомяни ключевые достопримечательности, атмосферу/культуру и дай один полезный совет. Избегай списков. Ответ дай на русском языке.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ description: text });
  } catch (err) {
    const message = (err as any)?.message || "Failed to generate description";
    console.error("/api/describe error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


