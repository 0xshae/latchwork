"use client";

import { useQuery } from "convex/react";
import { Plus, ArrowRight, Activity, Clock, CheckCircle2, PauseCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "../../../../convex/_generated/api";

export default function CampaignsPage() {
  const router = useRouter();
  const freelancer = useQuery(api.freelancers.current);
  
  // We can only query campaigns if we have the freelancer ID
  const campaigns = useQuery(
    api.campaigns.listByFreelancer,
    freelancer ? { freelancerId: freelancer._id } : "skip"
  );

  useEffect(() => {
    // If the freelancer query finishes and returns null, they haven't onboarded yet.
    if (freelancer === null) {
      router.push("/campaigns/new");
    }
  }, [freelancer, router]);

  if (freelancer === undefined || campaigns === undefined) {
    return (
      <div className="flex items-center justify-center h-64 text-neutral-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-lime-500 border-t-transparent animate-spin" />
          Loading campaigns...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Campaigns</h1>
          <p className="text-neutral-400 text-sm">Manage your outbound research and pipeline.</p>
        </div>
        <Link href="/campaigns/new" className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-lime-950 px-4 py-2 rounded-lg font-medium transition-colors text-sm">
          <Plus className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 border border-white/5 rounded-2xl bg-neutral-900/30">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No active campaigns</h3>
          <p className="text-neutral-400 max-w-sm mb-6">
            You haven't set up any outbound campaigns yet. Describe your ideal client and let the agent start researching.
          </p>
          <Link href="/campaigns/new" className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">
            Create Campaign
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => {
            let StatusIcon = Clock;
            let statusColor = "text-neutral-400";
            
            if (campaign.status === "active" || campaign.status === "researching") {
              StatusIcon = Activity;
              statusColor = "text-lime-400";
            } else if (campaign.status === "completed") {
              StatusIcon = CheckCircle2;
              statusColor = "text-emerald-400";
            } else if (campaign.status === "paused") {
              StatusIcon = PauseCircle;
              statusColor = "text-amber-400";
            }

            return (
              <Link 
                key={campaign._id} 
                href={`/campaigns/${campaign._id}`}
                className="group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border border-white/5 bg-neutral-900/30 hover:bg-neutral-900/80 transition-colors gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-white text-lg">{campaign.name}</h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase bg-white/5 border border-white/10">
                      <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                      <span className={statusColor}>{campaign.status.replace("_", " ")}</span>
                    </div>
                  </div>
                  <p className="text-neutral-400 text-sm">Target: {campaign.idealClient}</p>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-6 text-sm">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <span className="font-mono text-xs">{(new Date(campaign.createdAt)).toLocaleDateString()}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 group-hover:bg-white/10 group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
