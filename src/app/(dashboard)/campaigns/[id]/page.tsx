"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, CheckCircle2, ChevronRight, PlayCircle, Clock, ShieldAlert, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as Id<"campaigns">;
  
  const data = useQuery(api.campaigns.get, { campaignId });
  const [activationState, setActivationState] = useState<"idle" | "loading" | "error">("idle");
  const [activationError, setActivationError] = useState<string | null>(null);

  if (data === undefined) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-lime-500 border-t-transparent animate-spin" />
          Loading campaign details...
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-bold text-white mb-2">Campaign Not Found</h2>
        <p className="text-neutral-400 mb-6">The campaign you're looking for doesn't exist or you don't have access.</p>
        <Link href="/campaigns" className="text-lime-400 hover:underline">Return to Campaigns</Link>
      </div>
    );
  }

  const { campaign, freelancer, prospects } = data;
  const isDraft = campaign.status === "draft";
  const isAwaitingPayment = campaign.status === "awaiting_payment";
  const isActive = campaign.status === "active" || campaign.status === "researching";

  async function startActivation() {
    if (!campaignId || !freelancer?.email) return;
    setActivationState("loading");
    setActivationError(null);

    try {
      const response = await fetch("/api/activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, email: freelancer.email }),
      });
      const payload = (await response.json()) as { checkoutUrl?: string; error?: string };
      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(payload.error ?? "Latchwork could not open checkout.");
      }
      window.location.assign(payload.checkoutUrl);
    } catch (caughtError) {
      setActivationError(
        caughtError instanceof Error ? caughtError.message : "Latchwork could not open checkout.",
      );
      setActivationState("error");
    }
  }

  return (
    <div>
      <Link href="/campaigns" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Campaigns
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">{campaign.name}</h1>
            <div className="px-2.5 py-1 rounded-md text-xs font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-neutral-300">
              {campaign.status.replace("_", " ")}
            </div>
          </div>
          <p className="text-neutral-400">Targeting: {campaign.idealClient}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Activation Required Banner */}
          {(isDraft || isAwaitingPayment) && (
            <div className="bg-lime-500/10 border border-lime-500/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h3 className="text-lime-400 font-medium text-lg mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Ready for Agent Activation
                </h3>
                <p className="text-neutral-400 text-sm max-w-md">
                  Your brief is securely stored. Activate this campaign to deploy the research agent and start finding high-fit prospects.
                </p>
              </div>
              <button 
                onClick={startActivation}
                disabled={activationState === "loading"}
                className="whitespace-nowrap flex items-center justify-center gap-2 bg-lime-400 hover:bg-lime-300 text-lime-950 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {activationState === "loading" ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Preparing...</>
                ) : (
                  <>Activate for ₹199 <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          )}
          {activationError && (
             <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
             {activationError}
           </div>
          )}

          {/* Prospects Section */}
          <div className="bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Researched Prospects</h2>
              <span className="text-xs font-medium bg-white/10 text-neutral-300 px-2 py-1 rounded-full">
                {prospects.length} total
              </span>
            </div>
            
            {prospects.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-6 h-6 text-neutral-500" />
                </div>
                <p className="text-neutral-400 text-sm max-w-sm">
                  {isActive 
                    ? "The agent is currently researching prospects. They will appear here once verified."
                    : "Activate your campaign to start finding prospects matching your ideal client profile."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {prospects.map(prospect => (
                  <div key={prospect._id} className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between group">
                    <div>
                      <h4 className="font-medium text-white text-lg mb-1">{prospect.companyName}</h4>
                      <div className="flex items-center gap-3 text-sm text-neutral-400">
                        <span className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${prospect.fitScore >= 80 ? 'bg-lime-500' : 'bg-amber-500'}`} />
                          {prospect.fitScore}/100 Fit
                        </span>
                        <span>•</span>
                        <span className="capitalize">{prospect.status.replace("_", " ")}</span>
                      </div>
                    </div>
                    <Link href={`/prospects/${prospect._id}`} className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Brief Details</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-neutral-500 mb-1">Objective</div>
                <div className="text-sm text-white font-medium">{campaign.objective}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Primary Offer</div>
                <div className="text-sm text-neutral-300">{campaign.offer}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Target Description</div>
                <div className="text-sm text-neutral-300">{campaign.targetDescription || "None provided"}</div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Pipeline Status</h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:w-[2px] before:bg-white/10 before:-z-10">
              
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-lime-500 flex items-center justify-center shrink-0 ring-4 ring-neutral-950">
                  <CheckCircle2 className="w-4 h-4 text-lime-950" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">Brief Created</h4>
                  <p className="text-xs text-neutral-500">{(new Date(campaign.createdAt)).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ring-4 ring-neutral-950 ${isActive ? 'bg-lime-500' : (isAwaitingPayment || isDraft ? 'bg-neutral-800 border-2 border-white/20' : 'bg-lime-500')}`}>
                   {isActive ? <CheckCircle2 className="w-4 h-4 text-lime-950" /> : <div className="w-2 h-2 rounded-full bg-neutral-500" />}
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${isActive ? 'text-white' : 'text-neutral-400'}`}>Agent Activated</h4>
                  {campaign.activatedAt && <p className="text-xs text-neutral-500">{(new Date(campaign.activatedAt)).toLocaleDateString()}</p>}
                </div>
              </div>

              <div className="flex gap-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ring-4 ring-neutral-950 ${campaign.status === 'researching' ? 'bg-white border-2 border-lime-400 animate-pulse' : (prospects.length > 0 ? 'bg-lime-500' : 'bg-neutral-800 border-2 border-white/20')}`}>
                   {prospects.length > 0 ? <CheckCircle2 className="w-4 h-4 text-lime-950" /> : <div className="w-2 h-2 rounded-full bg-neutral-500" />}
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${prospects.length > 0 || campaign.status === 'researching' ? 'text-white' : 'text-neutral-400'}`}>Agent Researching</h4>
                  <p className="text-xs text-neutral-500">{prospects.length} found</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
