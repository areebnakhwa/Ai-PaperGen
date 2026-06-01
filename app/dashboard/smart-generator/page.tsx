"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Bot, FileText, Loader2, Save } from "lucide-react";
// KaTeX Imports for Math rendering
import "katex/dist/katex.min.css";
import { InlineMath } from "react-katex";
// Firebase Imports for Saving to Database
import { db } from "../../lib/firebase"; // Adjust path if your firebase.ts is somewhere else
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Helper function to render text mixed with math equations (e.g., $x^2$)
const formatTextWithMath = (text: string) => {
  if (!text) return null;
  // Splits text by $...$ keeping the delimiters
  const parts = text.split(/(\$.*?\$)/g);
  return parts.map((part, index) => {
    if (part.startsWith("$") && part.endsWith("$")) {
      // Remove $ and render as Math
      const mathContent = part.slice(1, -1);
      return <InlineMath key={index} math={mathContent} />;
    }
    return <span key={index}>{part}</span>;
  });
};

export default function SmartGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [notesContext, setNotesContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a command to generate the paper!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate-smart-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, notesContext }),
      });

      const result = await res.json();

      if (res.ok) {
        setGeneratedPaper(result.data);
        toast.success("Paper generated successfully!");
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to connect to AI");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToBank = async () => {
    if (!generatedPaper) return;
    setIsSaving(true);

    try {
      const questionsRef = collection(db, "questions"); // Aapke firestore collection ka naam (usually 'questions' hota hai)
      let savedCount = 0;

      // Loop through all sections and questions to save them
      for (const section of generatedPaper.sections) {
        for (const q of section.questions) {
          await addDoc(questionsRef, {
            questionText: q.questionText,
            type: q.type,
            options: q.options || [],
            correctAnswer: q.correctAnswer || "",
            marks: q.marks,
            subject: generatedPaper.title,
            standard: generatedPaper.standard,
            board: generatedPaper.board,
            createdAt: serverTimestamp(),
          });
          savedCount++;
        }
      }
      toast.success(
        `Successfully saved ${savedCount} questions to Question Bank!`,
      );
    } catch (error) {
      console.error("Error saving questions:", error);
      toast.error("Failed to save questions to database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="w-8 h-8 text-blue-500" />
          AI Smart Paper Generator
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Inputs */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              AI Command (Required)
            </label>
            <textarea
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              placeholder="e.g., Create a 10th standard Maharashtra board Math paper on Trigonometry. Total 40 marks."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Paste Notes/Syllabus (Optional)
            </label>
            <textarea
              className="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={6}
              placeholder="Paste text notes here. The AI will strictly use this context to create questions..."
              value={notesContext}
              onChange={(e) => setNotesContext(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Bot className="w-5 h-5" />
            )}
            {loading ? "Generating Paper..." : "Generate with AI"}
          </button>
        </div>

        {/* RIGHT COLUMN: Output */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[600px]">
          {!generatedPaper ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <p>Your generated paper will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Paper Header */}
              <div className="text-center border-b dark:border-gray-700 pb-4">
                <h2 className="text-2xl font-bold uppercase">
                  {generatedPaper.title}
                </h2>
                <div className="flex justify-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <span>Standard: {generatedPaper.standard}</span>
                  <span>Board: {generatedPaper.board}</span>
                  <span>Marks: {generatedPaper.totalMarks}</span>
                </div>
              </div>

              {/* Sections & Questions */}
              {generatedPaper.sections.map((section: any, secIndex: number) => (
                <div key={secIndex} className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                    <h3 className="font-bold text-lg">{section.sectionName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {section.sectionInstructions}
                    </p>
                  </div>

                  <div className="space-y-4 pl-4">
                    {section.questions.map((q: any, qIndex: number) => (
                      <div
                        key={qIndex}
                        className="border-b dark:border-gray-700 pb-4"
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-medium">
                            <span className="mr-2">{qIndex + 1}.</span>
                            {/* Yahan hum formatTextWithMath function call kar rahe hain */}
                            {formatTextWithMath(q.questionText)}
                          </p>
                          <span className="text-sm font-semibold whitespace-nowrap ml-4">
                            [{q.marks} Marks]
                          </span>
                        </div>

                        {q.type === "mcq" && q.options && (
                          <div className="grid grid-cols-2 gap-2 mt-3 ml-6">
                            {q.options.map((opt: string, optIndex: number) => (
                              <div
                                key={optIndex}
                                className="p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 text-sm"
                              >
                                {String.fromCharCode(97 + optIndex)}){" "}
                                {formatTextWithMath(opt)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveToBank}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? "Saving..." : "Save to Question Bank"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
