"use client";

import { useMutation } from "convex/react";
import { FormEvent, useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";

type OnboardingState = "editing" | "saving" | "error";

export default function NewCampaignPage() {
  const router = useRouter();
  const onboard = useMutation(api.campaigns.onboard);
  const [state, setState] = useState<OnboardingState>("editing");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");

    try {
      const result = await onboard({
        name: String(form.get("name") ?? ""),
        email,
        role: String(form.get("role") ?? ""),
        primaryOffer: String(form.get("offer") ?? ""),
        idealClient: String(form.get("idealClient") ?? ""),
        objective: String(form.get("objective") ?? ""),
      });

      // Redirect to the campaign details page which will handle the activation payment flow
      router.push(`/campaigns/${result.campaignId}`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Latchwork could not create this campaign.",
      );
      setState("error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create a New Campaign</h1>
        <p className="text-neutral-400 text-sm">
          Describe your offer and ideal client. Our agent will use this to research prospects and write tailored pitches.
        </p>
      </div>

      <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6 sm:p-8">
        <form className="grid gap-6" onSubmit={handleSubmit}>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-neutral-300">Your Name</label>
              <input 
                name="name" 
                required 
                placeholder="Shagun Prasad" 
                className="bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-neutral-300">Work Email</label>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="you@domain.com" 
                className="bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-neutral-300">What do you do?</label>
            <input
              name="role"
              required
              placeholder="Independent product and protocol engineer"
              className="bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-neutral-300">Primary Offer</label>
            <textarea
              name="offer"
              required
              rows={3}
              placeholder="I help teams ship privacy-first agentic commerce and payment infrastructure."
              className="bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-lime-500/50 resize-y min-h-[100px]"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-neutral-300">Ideal Client Profile</label>
              <input
                name="idealClient"
                required
                placeholder="AI-native fintechs, agent startups"
                className="bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-neutral-300">Campaign Objective</label>
              <input
                name="objective"
                required
                placeholder="Book three qualified discovery calls"
                className="bg-neutral-950 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-lime-500/50"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
            <p className="text-xs text-neutral-500 max-w-sm">
              Your profile stays private. Latchwork asks before any outreach, payment request, or client-facing action.
            </p>
            
            <button 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 text-lime-950 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={state === "saving"} 
              type="submit"
            >
              {state === "saving" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Save & Continue
                </>
              )}
            </button>
          </div>
          
          {error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
