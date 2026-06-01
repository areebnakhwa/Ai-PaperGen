import Link from "next/link";
import { BookOpen, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans selection:bg-blue-200">
      <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 text-center max-w-2xl w-full">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-blue-50 rounded-3xl flex items-center justify-center border border-blue-100">
            <BookOpen className="h-10 w-10 text-blue-600" />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
          Exam<span className="text-blue-600">Gen</span> AI
        </h1>

        <p className="text-lg text-gray-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
          The ultimate AI-powered question paper generator. Create perfectly
          formatted exams in seconds.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:-translate-y-1"
        >
          <Sparkles size={20} />
          Go to Dashboard
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
