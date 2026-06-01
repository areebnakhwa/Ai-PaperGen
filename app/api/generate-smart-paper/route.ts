import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY as string,
);

export async function POST(req: NextRequest) {
  try {
    const { prompt, notesContext } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    // Aapka set kiya hua model: hamesha gemini-2.5-flash use hoga
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Yahan hum System Prompt define kar rahe hain with DOUBLE-ESCAPE instructions
    const systemInstruction = `
    You are an expert exam paper setter for schools and colleges.
    Your task is to generate a highly structured exam paper based on the user's command and any provided notes.
    
    CRITICAL INSTRUCTIONS FOR JSON & LATEX:
    1. You MUST return the output STRICTLY in the following JSON format.
    2. Because the output is JSON, you MUST DOUBLE-ESCAPE all backslashes in your LaTeX formulas. 
       - For example, if the formula is $\\sin^2 \\theta$, you MUST write it as $\\\\sin^2 \\\\theta$ in the JSON.
       - Write $\\\\frac{1}{2}$ instead of $\\frac{1}{2}$.
       - If you use single backslashes, the JSON parser will fail!

    {
      "title": "Exam Title (e.g., Mathematics - Trigonometry)",
      "standard": "Standard/Class",
      "board": "Board Name (e.g., Maharashtra Board)",
      "totalMarks": "Total Marks",
      "sections": [
        {
          "sectionName": "Section A: Multiple Choice Questions",
          "sectionInstructions": "Choose the correct alternative.",
          "questions": [
            {
              "type": "mcq",
              "questionText": "What is the value of $\\\\sin^2 \\\\theta + \\\\cos^2 \\\\theta$?",
              "options": ["0", "1", "2", "-1"],
              "correctAnswer": "1",
              "marks": 1
            }
          ]
        },
        {
          "sectionName": "Section B: Solve the following",
          "sectionInstructions": "Show complete steps.",
          "questions": [
            {
              "type": "descriptive",
              "questionText": "Prove that $\\\\sec^2 A - \\\\tan^2 A = 1$.",
              "marks": 3
            }
          ]
        }
      ]
    }
    `;

    // Combine user prompt with notes (if any)
    const finalPrompt = `
      USER COMMAND: ${prompt}
      
      REFERENCE NOTES/CONTEXT (If provided, strictly generate questions from this content): 
      ${notesContext ? notesContext : "No notes provided, use your general knowledge."}
    `;

    const result = await model.generateContent([
      systemInstruction,
      finalPrompt,
    ]);
    const response = await result.response;
    let textOutput = response.text();

    // Clean the JSON string (remove markdown code blocks if Gemini adds them)
    textOutput = textOutput
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Double check to replace any accidental unescaped backslashes before parsing
    textOutput = textOutput.replace(/(?<!\\)\\(?![\\n"r/tbf])/g, "\\\\");

    const parsedData = JSON.parse(textOutput);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Error generating smart paper:", error);
    return NextResponse.json(
      { error: "Failed to generate paper" },
      { status: 500 },
    );
  }
}
