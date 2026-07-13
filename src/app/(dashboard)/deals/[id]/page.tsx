"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, CheckCircle2, ChevronRight, Copy, CreditCard, ExternalLink, Link2, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function DealDetailPage() {
  const params = useParams();
  const dealId = params.id as Id<"deals">;
  
  const data = useQuery(api.deals.get, { dealId });
  const [copied, setCopied] = useState(false);

  if (data === undefined) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-lime-500 border-t-transparent animate-spin" />
          Loading deal details...
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-bold text-white mb-2">Deal Not Found</h2>
        <Link href="/deals" className="text-lime-400 hover:underline">Return to Deals</Link>
      </div>
    );
  }

  const { deal, milestones } = data;
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / (currency === 'INR' ? 100 : 1)); // Assuming amount is in paise/cents if we followed standard Stripe/Dodo format, but schema has it as raw numbers? Schema says amount is number, wait, in schema we had amountPaise for payments, but amount for deal. Let's assume deal amount is full unit.
  };

  const copyProposalLink = () => {
    const url = `${window.location.origin}/proposal/${deal.proposalToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <Link href="/deals" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Deals
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">{deal.projectTitle}</h1>
            <div className="px-2.5 py-1 rounded-md text-xs font-mono tracking-wider uppercase bg-white/5 border border-white/10 text-neutral-300">
              {deal.status.replace("_", " ")}
            </div>
          </div>
          <p className="text-neutral-400 text-lg">Client: {deal.clientName}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={copyProposalLink}
            className="flex items-center gap-2 bg-neutral-900 border border-white/10 hover:bg-neutral-800 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-lime-400" /> : <Link2 className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Proposal Link"}
          </button>
          <Link 
            href={`/proposal/${deal.proposalToken}`}
            target="_blank"
            className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-lime-950 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            View as Client
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 bg-neutral-900/80 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-neutral-400" />
                Milestone Payment Plan
              </h2>
              <div className="text-xl font-bold text-white">
                Total: {deal.currency === 'INR' ? '₹' : '$'}{deal.totalAmount.toLocaleString()}
              </div>
            </div>
            
            <div className="divide-y divide-white/5">
              {milestones.map((milestone, i) => (
                <div key={milestone._id} className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono text-neutral-400">
                      0{milestone.sequence}
                    </div>
                    <div>
                      <h4 className="font-medium text-white mb-1">{milestone.label}</h4>
                      <p className="text-sm text-neutral-400">{milestone.percentage}% of total</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-white mb-1">
                      {deal.currency === 'INR' ? '₹' : '$'}{milestone.amount.toLocaleString()}
                    </div>
                    <div className={`text-xs font-mono uppercase tracking-wider ${
                      milestone.status === 'paid' ? 'text-lime-400' :
                      milestone.status === 'checkout_created' ? 'text-amber-400' :
                      'text-neutral-500'
                    }`}>
                      {milestone.status.replace("_", " ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Project Scope</h3>
            <div className="text-neutral-300 whitespace-pre-wrap text-sm leading-relaxed font-serif">
              {deal.scope}
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Deal Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-neutral-500 mb-1">Created</div>
                <div className="text-sm text-white font-medium">{(new Date(deal.createdAt)).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Client Email</div>
                <div className="text-sm text-white font-medium">{deal.clientEmail || "Not provided"}</div>
              </div>
              {deal.campaignId && (
                <div className="pt-4 border-t border-white/10">
                  <Link href={`/campaigns/${deal.campaignId}`} className="text-sm text-lime-400 hover:underline flex items-center gap-1">
                    View Associated Campaign <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Original Brief</h3>
            <div className="text-sm text-neutral-400 leading-relaxed line-clamp-6">
              {deal.brief}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
