"use client";

import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Building2, Check, ExternalLink, Mail, MessageSquare, ShieldCheck, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default function ProspectDetailPage() {
  const params = useParams();
  const prospectId = params.id as Id<"prospects">;
  
  const data = useQuery(api.prospects.get, { prospectId });
  const updateStatus = useMutation(api.prospects.updateStatus);
  const approvePitch = useMutation(api.pitches.approve);
  const markSent = useMutation(api.pitches.markSent);

  const [isApproving, setIsApproving] = useState(false);

  if (data === undefined) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-lime-500 border-t-transparent animate-spin" />
          Loading prospect details...
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-bold text-white mb-2">Prospect Not Found</h2>
        <Link href="/campaigns" className="text-lime-400 hover:underline">Return to Campaigns</Link>
      </div>
    );
  }

  const { prospect, pitches } = data;
  const activePitch = pitches[0]; // The agent generates one pitch per prospect usually

  const handleApprovePitch = async () => {
    if (!activePitch) return;
    setIsApproving(true);
    try {
      await approvePitch({ pitchId: activePitch._id });
    } finally {
      setIsApproving(false);
    }
  };

  const handleMarkSent = async () => {
    if (!activePitch) return;
    await markSent({ pitchId: activePitch._id });
  };

  return (
    <div>
      <Link href={`/campaigns/${prospect.campaignId}`} className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Campaign
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">{prospect.companyName}</h1>
            <div className={`px-2.5 py-1 rounded-md text-xs font-mono tracking-wider uppercase border ${
              prospect.status === 'approved' ? 'bg-lime-500/10 border-lime-500/20 text-lime-400' :
              prospect.status === 'pitched' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
              prospect.status === 'deal_created' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
              'bg-white/5 border-white/10 text-neutral-300'
            }`}>
              {prospect.status.replace("_", " ")}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-neutral-400 text-sm">
            {prospect.companyUrl && (
              <a href={prospect.companyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
                <Building2 className="w-4 h-4" />
                {new URL(prospect.companyUrl).hostname}
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}
            {prospect.contactName && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {prospect.contactName} {prospect.contactEmail && `(${prospect.contactEmail})`}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-neutral-900/80 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-4">
            <div>
              <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium mb-1">Agent Fit Score</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-white">{prospect.fitScore}</div>
                <div className="text-neutral-400 text-sm">/ 100</div>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${prospect.fitScore >= 80 ? 'bg-lime-500/20 text-lime-400' : 'bg-amber-500/20 text-amber-400'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {activePitch ? (
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-neutral-900/80">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-neutral-400" />
                  Agent Drafted Pitch
                </h2>
                {activePitch.status === 'draft' && (
                  <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                    Needs Review
                  </span>
                )}
                {activePitch.status === 'approved' && (
                  <span className="px-2 py-1 rounded bg-lime-500/10 text-lime-400 text-xs font-medium border border-lime-500/20 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Approved
                  </span>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4 pb-4 border-b border-white/5">
                  <div className="text-sm text-neutral-500 mb-1">Subject</div>
                  <div className="text-white font-medium">{activePitch.subject || "No subject generated"}</div>
                </div>
                <div className="text-neutral-300 whitespace-pre-wrap flex-1 text-sm leading-relaxed font-serif">
                  {activePitch.body}
                </div>
                
                {activePitch.status === 'draft' && (
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-end gap-3">
                    <button className="px-4 py-2 rounded-lg font-medium text-neutral-300 hover:text-white hover:bg-white/5 transition-colors">
                      Edit Pitch
                    </button>
                    <button 
                      onClick={handleApprovePitch}
                      disabled={isApproving}
                      className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-lime-950 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Approve for Sending
                    </button>
                  </div>
                )}
                
                {activePitch.status === 'approved' && (
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs text-neutral-500 max-w-sm">
                      This pitch has been approved. You can now send it through your email client and mark it as sent here.
                    </p>
                    <button 
                      onClick={handleMarkSent}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Mark as Sent
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-neutral-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No pitch generated yet</h3>
              <p className="text-neutral-400 text-sm max-w-sm mb-6">
                The agent is analyzing the fit and will generate a tailored pitch shortly.
              </p>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Agent Research Summary</h3>
            <div className="text-sm text-neutral-300 leading-relaxed mb-6">
              {prospect.researchSummary}
            </div>
            
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">Fit Reasoning</h3>
            <div className="p-4 rounded-xl bg-lime-500/5 border border-lime-500/10 text-sm text-lime-100/80 leading-relaxed">
              {prospect.fitReasoning}
            </div>
            
            {prospect.sourceUrl && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <a href={prospect.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  View Original Source
                </a>
              </div>
            )}
          </div>
          
          {prospect.status === 'replied' && (
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Next Steps</h3>
              <p className="text-sm text-neutral-400 mb-6">
                The prospect has replied. Once you've agreed on a scope of work, you can generate a milestone-based deal.
              </p>
              <button className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 text-white px-4 py-3 rounded-lg font-medium transition-colors">
                <Sparkles className="w-4 h-4" />
                Generate Deal Scope
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
