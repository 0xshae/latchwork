import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, Briefcase, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-lime-500 selection:text-lime-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-neutral-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-lime-400" />
            Latchwork<span className="text-lime-400">.</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-neutral-400 hover:text-white transition-colors">Log In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-lime-400 hover:bg-lime-300 text-lime-950 px-4 py-2 rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/campaigns" className="bg-lime-400 hover:bg-lime-300 text-lime-950 px-4 py-2 rounded-full transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)]">
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="flex h-2 w-2 rounded-full bg-lime-500 animate-pulse"></span>
          Latchwork v1.0 is now live
        </div>

        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-6 max-w-4xl bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          Find better work. <br className="hidden md:block" />
          Lock the deal. <br className="hidden md:block" />
          Get paid by milestone.
        </h1>

        <p className="text-xl text-neutral-400 max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          The autonomous revenue agent for independent professionals. We research high-fit prospects, write tailored pitches, and manage milestone payments so you can just do the work.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-lime-950 px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(163,230,53,0.4)] group">
                Start your first campaign
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/campaigns" className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-lime-950 px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(163,230,53,0.4)] group">
              Go to Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </SignedIn>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 text-left">
          <div className="p-8 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm hover:border-lime-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400 mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">AI-Powered Prospecting</h3>
            <p className="text-neutral-400">
              Our agent searches the web for companies that match your ideal client profile and scores them for fit.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm hover:border-lime-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400 mb-6">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">Tailored Pitches</h3>
            <p className="text-neutral-400">
              Generates personalized outreach based on the prospect's recent news and your specific offer. You approve everything.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm hover:border-lime-500/30 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-lime-500/10 flex items-center justify-center text-lime-400 mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-medium text-white mb-3">Locked-In Payments</h3>
            <p className="text-neutral-400">
              Automated milestone scopes (20% deposit, 40% midpoint, 40% delivery) with deterministic payment links.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 py-12 text-center text-neutral-500 text-sm">
        <p>Latchwork © 2026. Built for independent professionals.</p>
      </footer>
    </div>
  );
}
