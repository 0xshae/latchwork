import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const onboard = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    primaryOffer: v.string(),
    idealClient: v.string(),
    objective: v.string(),
  },
  handler: async (ctx, args) => {
    const createdAt = Date.now();
    const freelancerId = await ctx.db.insert("freelancers", {
      name: args.name,
      email: args.email.toLowerCase(),
      role: args.role,
      primaryOffer: args.primaryOffer,
      idealClient: args.idealClient,
      createdAt,
    });

    const campaignId = await ctx.db.insert("campaigns", {
      freelancerId,
      offer: args.primaryOffer,
      idealClient: args.idealClient,
      objective: args.objective,
      status: "draft",
      createdAt,
    });

    return { campaignId, freelancerId };
  },
});

export const get = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) return null;

    const freelancer = await ctx.db.get(campaign.freelancerId);
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
      .collect();

    return { campaign, freelancer, payments };
  },
});
