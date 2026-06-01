"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../lib/firebase"; // Sahi Path Yahan Hai
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import Link from "next/link";
import {
  Trash2,
  Search,
  Edit3,
  X,
  Zap,
  FlaskConical,
  Filter,
  Target,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Printer,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";

const MATH_SYMBOLS = [
  { label: "Fraction", latex: "\\frac{x}{y}" },
  { label: "Power", latex: "x^2" },
  { label: "Root", latex: "\\sqrt{x}" },
  { label: "Alpha α", latex: "\\alpha" },
  { label: "Beta β", latex: "\\beta" },
  { label: "Theta θ", latex: "\\theta" },
  { label: "Not Eq ≠", latex: "\\neq" },
  { label: "Sum ∑", latex: "\\sum_{i=1}^{n}" },
  { label: "Integral ∫", latex: "\\int_{a}^{b}" },
];

const SCIENCE_SYMBOLS = [
  { label: "Arrow →", latex: "\\rightarrow" },
  { label: "Degree °", latex: "^\\circ" },
  { label: "Delta Δ", latex: "\\Delta" },
  { label: "Micro μ", latex: "\\mu" },
  { label: "Ohm Ω", latex: "\\Omega" },
  { label: "Pi π", latex: "\\pi" },
  { label: "Celsius °C", latex: "^\\circ\\text{C}" },
];

export default function Dashboard() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [subjectFilter, setSubjectFilter] = useState("All");
  const [targetMarks, setTargetMarks] = useState(50);

  const [institution, setInstitution] = useState(
    "Department of Information Technology",
  );
  const [paperDetails, setPaperDetails] = useState<any>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [editForm, setEditForm] = useState({
    subject: "",
    questionText: "",
    mathFormula: "",
    marks: "",
    questionType: "Descriptive",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const fetchQuestions = async () => {
    try {
      const q = query(
        collection(db, "questions"),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestions(docs);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.institution) setInstitution(data.institution);
          if (data.paperDetails) setPaperDetails(data.paperDetails);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Kya aap sach mein is question ko delete karna chahte hain?",
      )
    ) {
      try {
        await deleteDoc(doc(db, "questions", id));
        setQuestions(questions.filter((q) => q.id !== id));
        setSelectedIds(selectedIds.filter((qId) => qId !== id));
      } catch (error) {
        alert("Delete karne mein error aaya!");
      }
    }
  };

  const openEditModal = (e: React.MouseEvent, q: any) => {
    e.stopPropagation();
    setEditingId(q.id);
    setEditForm({
      subject: q.subject || "",
      questionText: q.questionText?.trim() || "",
      mathFormula: q.mathFormula || "",
      marks: q.marks.toString(),
      questionType: q.questionType || "Descriptive",
      options: q.options?.length === 4 ? q.options : ["", "", "", ""],
      correctAnswer: q.correctAnswer || "",
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const questionRef = doc(db, "questions", editingId);
      const updateData: any = {
        questionText: editForm.questionText,
        mathFormula: editForm.mathFormula,
        marks: Number(editForm.marks),
      };

      if (editForm.questionType === "MCQ") {
        updateData.options = editForm.options;
        updateData.correctAnswer = editForm.correctAnswer;
      }

      await updateDoc(questionRef, updateData);

      setQuestions(
        questions.map((q) =>
          q.id === editingId ? { ...q, ...updateData } : q,
        ),
      );
      setEditingId(null);
    } catch (error) {
      alert("Update fail ho gaya bhai!");
    }
  };

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((qId) => qId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newOrder = [...selectedIds];
    if (direction === "up" && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [
        newOrder[index],
        newOrder[index - 1],
      ];
    } else if (direction === "down" && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [
        newOrder[index],
        newOrder[index + 1],
      ];
    }
    setSelectedIds(newOrder);
  };

  const uniqueSubjects = [
    "All",
    ...Array.from(
      new Set(questions.map((q) => q.subject?.toUpperCase() || "UNKNOWN")),
    ),
  ];

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      (q.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (q.questionText?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesSubject =
      subjectFilter === "All" ||
      (q.subject?.toUpperCase() || "UNKNOWN") === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const selectedQuestionsList = selectedIds
    .map((id) => questions.find((q) => q.id === id))
    .filter(Boolean);

  const currentSelectedMarks = selectedQuestionsList.reduce(
    (sum, q) => sum + Number(q.marks),
    0,
  );
  const isMarksExceeded = currentSelectedMarks > targetMarks;

  const addMathSymbol = (latexCode: string) => {
    setEditForm((prev) => ({
      ...prev,
      mathFormula: prev.mathFormula
        ? `${prev.mathFormula} ${latexCode}`
        : latexCode,
    }));
  };

  const subjectName = editForm.subject.toLowerCase();
  const isMath = subjectName.includes("math");
  const isScience =
    subjectName.includes("science") ||
    subjectName.includes("physic") ||
    subjectName.includes("chemist");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 print:p-0 print:bg-white relative transition-colors duration-300">
      <div className="max-w-6xl mx-auto print:hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
              Question{" "}
              <span className="text-blue-600 dark:text-blue-400">Bank</span> 📚
            </h1>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto items-center">
            <button
              onClick={toggleTheme}
              className="md:hidden p-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} />
              )}
            </button>

            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 font-bold text-sm shadow-sm transition-all w-full sm:w-auto justify-center ${isMarksExceeded ? "border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400" : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"}`}
            >
              <Target
                size={18}
                className={
                  isMarksExceeded
                    ? "text-red-500 dark:text-red-400"
                    : "text-gray-400"
                }
              />
              <div className="flex items-center gap-1">
                <span>{currentSelectedMarks}</span>
                <span className="text-gray-400 font-medium">/</span>
                <input
                  type="number"
                  value={targetMarks}
                  onChange={(e) => setTargetMarks(Number(e.target.value) || 0)}
                  className={`w-12 bg-transparent outline-none border-b-2 focus:border-blue-500 dark:focus:border-blue-400 text-center ${isMarksExceeded ? "border-red-300 dark:border-red-500" : "border-gray-300 dark:border-gray-700"}`}
                />
              </div>
              {isMarksExceeded && (
                <AlertCircle
                  size={16}
                  className="text-red-500 animate-pulse ml-1"
                />
              )}
            </div>

            <button
              onClick={() => setShowPreview(true)}
              disabled={selectedIds.length === 0}
              className={`flex-1 sm:flex-none justify-center px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                selectedIds.length === 0
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 cursor-not-allowed shadow-sm"
                  : isMarksExceeded
                    ? "bg-red-600 text-white hover:bg-red-700 animate-pulse shadow-md shadow-red-200 dark:shadow-none"
                    : "bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200 dark:shadow-none"
              }`}
            >
              📄 Preview Paper ({selectedIds.length})
            </button>
            <Link
              href="/dashboard/auto-generate"
              className="flex-1 sm:flex-none justify-center text-center bg-gray-900 dark:bg-purple-600 text-white px-5 py-3 rounded-xl font-bold shadow-md shadow-gray-300 dark:shadow-none hover:bg-black dark:hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <Sparkles size={18} className="text-yellow-400 dark:text-white" />{" "}
              Auto-Gen
            </Link>
            <Link
              href="/dashboard/add-question"
              className="flex-1 sm:flex-none justify-center text-center bg-blue-600 text-white px-5 py-3 rounded-xl font-bold shadow-md shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all"
            >
              + Add New
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search questions by topic or text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3.5 pl-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            />
          </div>

          <div className="relative min-w-full sm:min-w-[200px]">
            <Filter
              className="absolute left-4 top-3.5 text-blue-500"
              size={18}
            />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full p-3.5 pl-12 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-blue-900 dark:text-blue-100 font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              {uniqueSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub === "All" ? "All Subjects" : sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 font-bold text-xl animate-pulse text-gray-400 dark:text-gray-600">
            Loading your questions...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2rem] border border-dashed border-gray-300 dark:border-gray-700">
            <p className="font-bold text-gray-400 dark:text-gray-500 mb-2">
              No questions found! 🧐
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-600">
              Try changing your search or filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {filteredQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => toggleSelection(q.id)}
                className={`p-5 md:p-6 rounded-3xl shadow-sm border cursor-pointer transition-all flex flex-col group ${
                  selectedIds.includes(q.id)
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 scale-[1.01]"
                    : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-none hover:border-gray-200 dark:hover:border-gray-700"
                }`}
              >
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                      {q.subject} {q.questionType === "MCQ" && "• MCQ"}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 font-bold text-xs bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                      {q.marks} Marks
                    </span>
                    {q.difficulty && (
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border ${q.difficulty === "Easy" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" : q.difficulty === "Medium" ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"}`}
                      >
                        {q.difficulty}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shrink-0">
                    <button
                      onClick={(e) => openEditModal(e, q)}
                      className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, q.id)}
                      className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <p className="text-gray-800 dark:text-gray-200 font-semibold mb-4 text-sm leading-relaxed whitespace-pre-wrap">
                  {q.questionText?.trim()}
                </p>

                {q.mathFormula && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl flex justify-center border border-gray-100 dark:border-gray-800 overflow-x-auto text-sm mb-4 dark:text-white">
                    <BlockMath math={q.mathFormula} />
                  </div>
                )}

                {q.questionType === "MCQ" &&
                  q.options &&
                  q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                      {q.options.map((opt: string, idx: number) => {
                        const isCorrect = opt === q.correctAnswer;
                        return (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-2 ${isCorrect ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300"}`}
                          >
                            <span
                              className={`h-5 w-5 flex items-center justify-center rounded-md shrink-0 ${isCorrect ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="truncate">{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✨ PREVIEW MODAL ✨ */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-transparent dark:border-gray-800">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-gray-950">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  Review & Order Paper
                </h3>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                  Total: {currentSelectedMarks} Marks | {selectedIds.length}{" "}
                  Questions
                </p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-3 bg-gray-100 dark:bg-gray-950">
              {selectedQuestionsList.map((q, index) => (
                <div
                  key={q.id}
                  className="flex gap-4 items-center bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 group"
                >
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => moveQuestion(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded disabled:opacity-30 transition-all"
                    >
                      <ArrowUp size={20} />
                    </button>
                    <button
                      onClick={() => moveQuestion(index, "down")}
                      disabled={index === selectedQuestionsList.length - 1}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded disabled:opacity-30 transition-all"
                    >
                      <ArrowDown size={20} />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded text-xs">
                        Q{index + 1}
                      </span>
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded">
                        {q.marks} Marks
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {q.questionText?.trim()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-800 shrink-0 flex flex-col sm:flex-row justify-end gap-3 bg-white dark:bg-gray-900">
              <button
                onClick={() => setShowPreview(false)}
                className="w-full sm:w-auto px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setTimeout(() => window.print(), 300);
                }}
                className="w-full sm:w-auto px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 dark:shadow-none flex justify-center items-center gap-2"
              >
                <Printer size={20} />
                Confirm & Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🖨️ PRO-LEVEL PRINTABLE EXAM PAPER (Always White!) */}
      <div className="hidden print:block bg-white dark:print:bg-white text-black dark:print:text-black p-10 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10 pb-6 border-b-[3px] border-black">
          <div className="w-24 h-24 flex items-center justify-start shrink-0">
            {paperDetails?.logo && (
              <img
                src={paperDetails.logo}
                alt="Logo"
                className="max-w-full max-h-full object-contain grayscale"
              />
            )}
          </div>

          <div className="flex-1 text-center px-4">
            <h1 className="text-3xl font-serif font-black uppercase mb-2">
              {institution}
            </h1>
            <h2 className="text-xl font-bold uppercase tracking-wide">
              {paperDetails?.examName || "Examination Paper"}
            </h2>
          </div>

          <div className="w-24 h-24 shrink-0"></div>
        </div>

        <div className="flex justify-between mt-4 font-bold text-[15px]">
          <p>
            Subject:{" "}
            <span className="border-b border-black border-dashed min-w-[150px] inline-block">
              {subjectFilter !== "All" ? subjectFilter : "________________"}
            </span>
          </p>
          <p>
            Date:{" "}
            <span className="border-b border-black border-dashed min-w-[150px] inline-block text-right">
              {paperDetails?.examDate || "________________"}
            </span>
          </p>
        </div>
        <div className="flex justify-between mt-3 font-bold text-[15px]">
          <p>
            Time Limit:{" "}
            <span className="border-b border-black border-dashed min-w-[150px] inline-block">
              {paperDetails?.timeLimit || "________________"}
            </span>
          </p>
          <p>
            Total Marks:{" "}
            <span className="border-b border-black border-dashed min-w-[150px] inline-block text-right">
              {currentSelectedMarks}
            </span>
          </p>
        </div>

        {paperDetails?.instructions && (
          <div className="mt-8 text-left border border-black p-5 text-sm font-medium whitespace-pre-wrap rounded-md">
            <p className="font-bold mb-2 uppercase tracking-wide">
              General Instructions:
            </p>
            <p className="leading-relaxed">{paperDetails.instructions}</p>
          </div>
        )}

        <div className="space-y-10 mt-10">
          {selectedQuestionsList.map((q, index) => (
            <div key={q.id} className="flex gap-4">
              <div className="font-bold text-lg">Q{index + 1}.</div>
              <div className="flex-1">
                <p className="mb-3 whitespace-pre-wrap text-[15px]">
                  {q.questionText?.trim()}
                </p>
                {q.mathFormula && (
                  <div className="mb-3">
                    <BlockMath math={q.mathFormula} />
                  </div>
                )}

                {q.questionType === "MCQ" &&
                  q.options &&
                  q.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-5 text-[15px]">
                      {q.options.map((opt: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="font-bold">
                            ({String.fromCharCode(97 + idx)})
                          </span>{" "}
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              <div className="font-bold text-lg">[{q.marks}]</div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center font-bold text-sm tracking-widest uppercase">
          *** Best of Luck ***
        </div>
      </div>

      {/* 🪄 PRO EDIT MODAL */}
      {editingId && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-transparent dark:border-gray-800">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Edit {editForm.questionType}{" "}
                <Edit3 size={18} className="text-blue-600 dark:text-blue-400" />
              </h3>
              <button
                onClick={() => setEditingId(null)}
                className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <form
                id="editForm"
                onSubmit={handleUpdate}
                className="p-4 md:p-6 space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Marks
                    </label>
                    <input
                      type="number"
                      value={editForm.marks}
                      onChange={(e) =>
                        setEditForm({ ...editForm, marks: e.target.value })
                      }
                      className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex justify-between items-end">
                      <span>
                        {isMath
                          ? "Math Formula (LaTeX)"
                          : isScience
                            ? "Science Equation (LaTeX)"
                            : "Extra Text (Optional)"}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={editForm.mathFormula}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          mathFormula: e.target.value,
                        })
                      }
                      placeholder={
                        isMath || isScience
                          ? "e.g. x^2 + y^2 = r^2"
                          : "Any extra text..."
                      }
                      className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-gray-900 dark:text-white"
                    />

                    {isMath && (
                      <div className="mt-2 flex flex-wrap gap-2 p-3 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <Zap
                          size={14}
                          className="text-blue-500 mt-0.5 shrink-0"
                        />
                        {MATH_SYMBOLS.map((sym, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => addMathSymbol(sym.latex)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-sm"
                          >
                            {sym.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {isScience && !isMath && (
                      <div className="mt-2 flex flex-wrap gap-2 p-3 bg-green-50/80 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                        <FlaskConical
                          size={14}
                          className="text-green-600 mt-0.5 shrink-0"
                        />
                        {SCIENCE_SYMBOLS.map((sym, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => addMathSymbol(sym.latex)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-600 hover:text-white dark:hover:bg-green-500 dark:hover:text-white transition-all shadow-sm"
                          >
                            {sym.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Question Text
                  </label>
                  <textarea
                    value={editForm.questionText}
                    onChange={(e) =>
                      setEditForm({ ...editForm, questionText: e.target.value })
                    }
                    className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-28 font-medium resize-none text-gray-900 dark:text-white"
                  />
                </div>

                {editForm.questionType === "MCQ" && (
                  <div className="p-4 md:p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-4">
                    <label className="block text-sm font-bold text-blue-900 dark:text-blue-300 border-b border-blue-100 dark:border-blue-900/30 pb-2">
                      MCQ Options
                    </label>

                    <div className="space-y-3">
                      {editForm.options.map((opt, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <span className="font-black text-sm text-blue-400 bg-white dark:bg-gray-800 h-8 w-8 flex items-center justify-center rounded-lg shadow-sm border border-blue-100 dark:border-gray-700 shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...editForm.options];
                              newOptions[idx] = e.target.value;
                              setEditForm({ ...editForm, options: newOptions });
                            }}
                            className="flex-1 w-full p-2.5 bg-white dark:bg-gray-800 border border-white dark:border-gray-700 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-gray-900 dark:text-white"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-bold text-blue-900 dark:text-blue-300 mb-1 uppercase tracking-wider">
                        Correct Answer
                      </label>
                      <select
                        value={editForm.correctAnswer}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            correctAnswer: e.target.value,
                          })
                        }
                        className="w-full p-3 bg-white dark:bg-gray-800 border border-white dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500 font-bold text-gray-800 dark:text-white shadow-sm"
                      >
                        <option value="" disabled>
                          Select the correct option
                        </option>
                        {editForm.options.map((opt, idx) =>
                          opt ? (
                            <option key={idx} value={opt}>
                              Option {String.fromCharCode(65 + idx)}: {opt}
                            </option>
                          ) : null,
                        )}
                      </select>
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 flex flex-col sm:flex-row gap-3 bg-gray-50/50 dark:bg-gray-950">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="w-full sm:w-auto flex-1 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="editForm"
                className="w-full sm:w-auto flex-1 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 dark:shadow-none flex justify-center items-center gap-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
