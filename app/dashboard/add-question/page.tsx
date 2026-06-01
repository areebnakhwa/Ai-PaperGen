"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase"; // ✨ Path ekdum theek hai
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Save,
  FileQuestion,
  BookOpen,
  BrainCircuit,
  Gauge,
} from "lucide-react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

export default function AddQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [marks, setMarks] = useState("5");
  const [qType, setQType] = useState("Descriptive");
  const [difficulty, setDifficulty] = useState("Medium");

  const [generatedQ, setGeneratedQ] = useState({
    text: "",
    formula: "",
    options: [] as string[],
    correctAnswer: "",
  });

  const handleGenerateAI = async () => {
    if (!subject || !topic) {
      alert("Bhai pehle Subject aur Topic toh daalo!");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic, subject, marks, difficulty }),
      });
      if (!response.ok) throw new Error("API Route failed");
      const data = await response.json();
      let responseText = data.question;
      responseText = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const aiData = JSON.parse(responseText);

      setGeneratedQ({
        text: aiData.text?.trim() || "",
        formula: aiData.formula || "",
        options: aiData.options || [],
        correctAnswer: aiData.correctAnswer || "",
      });
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("AI ne response deny kar diya. Console check karo!");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedQ.text) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "questions"), {
        subject: subject.toUpperCase(),
        topic,
        questionType: qType,
        marks: Number(marks),
        difficulty: difficulty,
        questionText: generatedQ.text,
        mathFormula: generatedQ.formula,
        options: generatedQ.options,
        correctAnswer: generatedQ.correctAnswer,
        createdAt: new Date(),
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Save nahi hua bhai! Database error.");
    }
    setSaving(false);
  };

  return (
    <div className="font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-500 dark:text-gray-400"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              Generate Question{" "}
              <BrainCircuit className="text-blue-600 dark:text-blue-400" />
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">
              Use AI to craft perfect questions for your exam paper.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* FORM CARD - DARK MODE ENABLED */}
          <div className="lg:col-span-5 space-y-6 bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <BookOpen
                  size={16}
                  className="text-blue-600 dark:text-blue-400"
                />{" "}
                Subject Name
              </label>
              <input
                type="text"
                placeholder="e.g. Science, PGIS"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <FileQuestion
                  size={16}
                  className="text-blue-600 dark:text-blue-400"
                />{" "}
                Topic / Keywords
              </label>
              <input
                type="text"
                placeholder="e.g. Body Parts, Software Testing"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Question Type
                </label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-700 dark:text-white"
                >
                  <option value="Descriptive">Descriptive</option>
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Marks
                </label>
                {/* ✨ FIX: Yahan galti thi, ab </select> laga diya hai! */}
                <select
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-700 dark:text-white"
                >
                  <option value="1">1 Mark</option>
                  <option value="2">2 Marks</option>
                  <option value="5">5 Marks</option>
                  <option value="10">10 Marks</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Gauge
                  size={16}
                  className="text-orange-500 dark:text-orange-400"
                />{" "}
                AI Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold text-gray-700 dark:text-white"
              >
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard</option>
              </select>
            </div>

            <button
              onClick={handleGenerateAI}
              disabled={loading}
              className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <span className="animate-pulse">Generating Magic... ✨</span>
              ) : (
                <>
                  <Sparkles size={20} /> Generate with AI
                </>
              )}
            </button>
          </div>

          {/* PREVIEW CARD - DARK MODE ENABLED */}
          <div className="lg:col-span-7">
            <div
              className={`h-full bg-white dark:bg-gray-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-all ${generatedQ.text ? "ring-2 ring-blue-100 dark:ring-blue-900/50" : ""}`}
            >
              <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex justify-between">
                <span>Live Preview</span>
                {generatedQ.text && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${difficulty === "Easy" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : difficulty === "Medium" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"}`}
                  >
                    {difficulty}
                  </span>
                )}
              </h2>

              {!generatedQ.text ? (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                  <BrainCircuit size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">
                    AI generated question will appear here.
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      {subject} • {qType}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 font-bold text-sm bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg border border-gray-100 dark:border-gray-700">
                      {marks} Marks
                    </span>
                  </div>

                  <p className="text-gray-900 dark:text-white font-semibold text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                    {generatedQ.text}
                  </p>

                  {generatedQ.formula && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl flex justify-center border border-gray-100 dark:border-gray-800 mb-6 overflow-x-auto dark:text-white">
                      <BlockMath math={generatedQ.formula} />
                    </div>
                  )}

                  {qType === "MCQ" &&
                    generatedQ.options &&
                    generatedQ.options.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {generatedQ.options.map((opt, idx) => {
                          const isCorrect = opt === generatedQ.correctAnswer;
                          return (
                            <div
                              key={idx}
                              className={`p-4 rounded-xl border-2 font-medium flex items-center gap-3 ${isCorrect ? "border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300" : "border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
                            >
                              <span
                                className={`h-6 w-6 flex items-center justify-center rounded-md text-xs font-bold ${isCorrect ? "bg-green-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
                              >
                                {String.fromCharCode(65 + idx)}
                              </span>
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                    )}

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="mt-8 w-full py-4 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-black dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200 dark:shadow-none"
                  >
                    {saving ? (
                      "Saving to Database..."
                    ) : (
                      <>
                        <Save size={20} /> Save to Question Bank
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
