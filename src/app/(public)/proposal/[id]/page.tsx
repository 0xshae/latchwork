"use client";

import { useQuery } from "convex/react";
import { CheckCircle2, ChevronRight, FileText, LayoutList, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../../convex/_generated/api";

export default function ClientProposalPage() {
  const params = useParams();
  const proposalToken = params.id as string;
  
  const data = useQuery(api.deals.getByProposalToken, { proposalToken });
  const [isProcessing, setIsProcessing] = useState(false);

  if (data === undefined) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center text-neutral-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-lime-500 border-t-transparent animate-spin" />
          Loading proposal...
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Proposal Not Found</h2>
          <p className="text-neutral-500">This proposal link may be invalid or has expired.</p>
        </div>
      </div>
    );
  }

  const { deal, milestones, freelancerName } = data;
  const currencySymbol = deal.currency === 'INR' ? '₹' : '$';
  
  // Find the next pending milestone (usually the deposit)
  const nextMilestone = milestones.find(m => m.status === 'pending' || m.status === 'checkout_created');
  
  const handleCheckout = async () => {
    if (!nextMilestone) return;
    setIsProcessing(true);
    // In Phase 4 we will integrate the Dodo checkout flow here
    // For now, simulate delay then throw an error as it's not hooked up
    setTimeout(() => {
      setIsProcessing(false);
      alert("Payment integration coming in Phase 4!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-lime-200">
      <header className="bg-white border-b border-neutral-200 py-6 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-lime-400 flex items-center justify-center text-lime-950">
              <span className="sr-only">Latchwork</span>
              L
            </div>
            Proposal
          </div>
          <div className="text-sm font-medium text-neutral-500">
            Prepared by <span className="text-neutral-900">{freelancerName}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs font-medium mb-6 uppercase tracking-wider">
            Statement of Work
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {deal.projectTitle}
          </h1>
          <p className="text-xl text-neutral-500 leading-relaxed">
            Prepared for {deal.clientName}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column: Scope */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 border-b border-neutral-200 pb-4">
                <LayoutList className="w-6 h-6 text-lime-500" />
                Project Scope
              </h2>
              <div className="prose prose-neutral max-w-none prose-p:leading-relaxed prose-li:my-1 text-neutral-600 font-serif whitespace-pre-wrap">
                {deal.scope}
              </div>
            </section>
          </div>

          {/* Right Column: Payment & Milestones */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 sticky top-8">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-2">Total Investment</h3>
              <div className="text-4xl font-bold text-neutral-900 mb-8">
                {currencySymbol}{deal.totalAmount.toLocaleString()}
              </div>

              <div className="space-y-6 mb-8 relative before:absolute before:inset-0 before:ml-[11px] before:w-[2px] before:bg-neutral-100 before:-z-10">
                {milestones.map((milestone, idx) => {
                  const isPaid = milestone.status === 'paid';
                  const isCurrent = nextMilestone?._id === milestone._id;
                  
                  return (
                    <div key={milestone._id} className={`flex gap-4 ${isPaid ? 'opacity-60' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white ${isPaid ? 'bg-neutral-900 text-white' : isCurrent ? 'bg-lime-400 text-lime-950' : 'bg-neutral-200 text-neutral-500'}`}>
                        {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-semibold ${isCurrent ? 'text-neutral-900' : 'text-neutral-600'}`}>{milestone.label}</h4>
                          <span className="font-semibold text-neutral-900">{currencySymbol}{milestone.amount.toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-neutral-500">{milestone.percentage}% due {idx === 0 ? 'to begin work' : idx === 1 ? 'at midpoint' : 'upon delivery'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {nextMilestone && (
                <div className="pt-6 border-t border-neutral-200">
                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white px-6 py-4 rounded-xl font-medium transition-transform active:scale-[0.98] disabled:opacity-70"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-neutral-400" />
                        Pay {currencySymbol}{nextMilestone.amount.toLocaleString()} Deposit
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Secure payment processed via Dodo
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
