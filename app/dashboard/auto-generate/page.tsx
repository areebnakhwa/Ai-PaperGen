"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import {
  Save,
  Building2,
  FileText,
  Calendar,
  Clock,
  BookOpen,
  Image as ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ExamDetailsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    institution: "",
    examName: "",
    examDate: "",
    timeLimit: "",
    instructions: "",
    logo: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            institution: data.institution || "",
            examName: data.paperDetails?.examName || "",
            examDate: data.paperDetails?.examDate || "",
            timeLimit: data.paperDetails?.timeLimit || "",
            instructions: data.paperDetails?.instructions || "",
            logo: data.paperDetails?.logo || "",
          });
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Logo ka size 1MB se kam hona chahiye bhai!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", userId), {
        institution: formData.institution,
        paperDetails: {
          examName: formData.examName,
          examDate: formData.examDate,
          timeLimit: formData.timeLimit,
          instructions: formData.instructions,
          logo: formData.logo,
        },
      });
      alert("Exam details aur Logo ekdum mast save ho gaye! 🚀");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving details:", error);
      alert("Save fail ho gaya!");
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="p-10 text-center font-bold text-gray-500 dark:text-gray-400 animate-pulse">
        Loading settings...
      </div>
    );

  return (
    <div className="font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            Paper Settings{" "}
            <FileText className="text-blue-600 dark:text-blue-400" />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            Set up the header and instructions for your printed exam paper.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-6 transition-colors">
          {/* UPLOAD LOGO UI */}
          <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col sm:flex-row items-center gap-6">
            <div className="h-24 w-24 bg-white dark:bg-gray-950 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {formData.logo ? (
                <img
                  src={formData.logo}
                  alt="College Logo"
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <ImageIcon
                  className="text-blue-300 dark:text-blue-700"
                  size={32}
                />
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                Institution Logo
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Upload your college/school logo. It will appear on the top left
                of the printed paper.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 transition-all cursor-pointer"
              />
            </div>
            {formData.logo && (
              <button
                onClick={() => setFormData({ ...formData, logo: "" })}
                className="text-xs text-red-500 dark:text-red-400 font-bold hover:underline"
              >
                Remove
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Building2
                size={16}
                className="text-blue-600 dark:text-blue-400"
              />{" "}
              Institution Name
            </label>
            <input
              type="text"
              value={formData.institution}
              onChange={(e) =>
                setFormData({ ...formData, institution: e.target.value })
              }
              placeholder="e.g. Shree L.R. Tiwari Degree College"
              className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-lg uppercase text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <BookOpen
                  size={16}
                  className="text-blue-600 dark:text-blue-400"
                />{" "}
                Exam Name
              </label>
              <input
                type="text"
                value={formData.examName}
                onChange={(e) =>
                  setFormData({ ...formData, examName: e.target.value })
                }
                placeholder="e.g. Semester V Preliminary"
                className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar
                  size={16}
                  className="text-blue-600 dark:text-blue-400"
                />{" "}
                Date
              </label>
              <input
                type="text"
                value={formData.examDate}
                onChange={(e) =>
                  setFormData({ ...formData, examDate: e.target.value })
                }
                placeholder="e.g. 15th October 2025"
                className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Clock size={16} className="text-blue-600 dark:text-blue-400" />{" "}
              Time Limit
            </label>
            <input
              type="text"
              value={formData.timeLimit}
              onChange={(e) =>
                setFormData({ ...formData, timeLimit: e.target.value })
              }
              placeholder="e.g. 2 Hours 30 Mins"
              className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <FileText
                size={16}
                className="text-blue-600 dark:text-blue-400"
              />{" "}
              General Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              placeholder="1. All questions are compulsory..."
              className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium h-32 resize-none leading-relaxed text-gray-900 dark:text-white"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:shadow-blue-300 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {saving ? (
              "Updating Details..."
            ) : (
              <>
                <Save size={20} /> Save Exam Details
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
