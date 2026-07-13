import { UserButton } from "@clerk/nextjs";
import { Briefcase, FileText, FolderGit2, Home, Settings } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-neutral-900/50 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/" className="font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-lime-400" />
            Latchwork
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          <Link href="/campaigns" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors">
            <Home className="w-4 h-4" />
            Campaigns
          </Link>
          <Link href="/prospects" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors">
            <FolderGit2 className="w-4 h-4" />
            Prospects
          </Link>
          <Link href="/deals" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors">
            <Briefcase className="w-4 h-4" />
            Deals
          </Link>
          <Link href="/proposals" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors">
            <FileText className="w-4 h-4" />
            Proposals
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-300 hover:text-white hover:bg-white/5 transition-colors mb-2">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
            <div className="text-sm font-medium">Account</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-white/10 flex items-center justify-between px-6 bg-neutral-900/50">
          <Link href="/" className="font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-lime-400" />
            Latchwork
          </Link>
          <UserButton afterSignOutUrl="/" />
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
