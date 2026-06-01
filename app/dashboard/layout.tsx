"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Database,
  PlusCircle,
  Sparkles,
  Settings,
  LogOut,
  Bot,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { name: "Question Bank", href: "/dashboard", icon: Database },
    { name: "Add Question", href: "/dashboard/add-question", icon: PlusCircle },
    { name: "Auto-Generate", href: "/dashboard/auto-generate", icon: Sparkles },
    { name: "Smart Generator", href: "/dashboard/smart-generator", icon: Bot }, // <-- Naya link yahan add kiya hai
    { name: "Exam Details", href: "/dashboard/details", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#0B1120] border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between shrink-0">
        {/* Top Section: Logo & Links */}
        <div>
          <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="text-blue-500 text-2xl">◎</span> ExamGen AI
            </h1>
          </div>

          <nav className="p-4 space-y-2 mt-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5" />
            Logout System
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Agar aapka top header (jisme email aur theme toggle hai) is layout mein hai, 
            toh wo aapke 'children' ke andar render hoga ya yahan upar add hoga. */}
        {children}
      </main>
    </div>
  );
}
