import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// ⚠️ SECURITY TIP: Apna API key direct code mein likhne ke badle process.env.NEXT_PUBLIC_GEMINI_API_KEY use karna zyada safe hota hai jab aap Vercel par daaloge. Abhi ke liye theek hai.
const genAI = new GoogleGenerativeAI("AIzaSyCHWi32_KdL4bT0kSPk8kS9YCJEP-E0-ow");

export async function POST(req: Request) {
  try {
    // ✨ NAYA: Humne 'difficulty' bhi extract kar liya yahan (default 'Medium' rakha hai)
    const { prompt, subject, marks, difficulty = "Medium" } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // ✨ NAYA: AI ko difficulty ka strict instruction de diya
    const systemPrompt = `You are an expert academic teacher. Generate a single ${marks}-mark question for the subject ${subject} based on this topic/prompt: "${prompt}".
    The difficulty level of this question MUST be strictly: ${difficulty}.
    
    CRITICAL RULES:
    1. Even if the topic is requested in Hindi/Hinglish, you MUST return the final question in PROPER ACADEMIC ENGLISH.
    2. If the question contains Math, Physics equations, or formulas, you MUST use strict LaTeX formatting for those parts.
    3. Return ONLY the final question text. No introductory text, no answers, no options (unless requested).`;

    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();

    return NextResponse.json({ question: responseText });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "Failed to generate question" },
      { status: 500 },
    );
  }
}
