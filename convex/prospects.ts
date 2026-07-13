import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Create Prospects ────────────────────────────────────────────
// Batch-insert prospects from AI research. Called by the research agent.
export const createBatch = mutation({
  args: {
    campaignId: v.id("campaigns"),
    prospects: v.array(
      v.object({
        companyName: v.string(),
        companyUrl: v.optional(v.string()),
        contactName: v.optional(v.string()),
        contactEmail: v.optional(v.string()),
        sourceUrl: v.optional(v.string()),
        researchSummary: v.string(),
        fitScore: v.number(),
        fitReasoning: v.string(),
      }),
    ),
  },
  handler: async (ctx, { campaignId, prospects }) => {
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");

    const now = Date.now();
    const ids = [];
    for (const prospect of prospects) {
      const id = await ctx.db.insert("prospects", {
        campaignId,
        companyName: prospect.companyName,
        companyUrl: prospect.companyUrl,
        contactName: prospect.contactName,
        contactEmail: prospect.contactEmail,
        sourceUrl: prospect.sourceUrl,
        researchSummary: prospect.researchSummary,
        fitScore: prospect.fitScore,
        fitReasoning: prospect.fitReasoning,
        status: "identified",
        createdAt: now,
      });
      ids.push(id);
    }
    return ids;
  },
});

// ─── Update Prospect Status ──────────────────────────────────────
export const updateStatus = mutation({
  args: {
    prospectId: v.id("prospects"),
    status: v.union(
      v.literal("identified"),
      v.literal("reviewed"),
      v.literal("approved"),
      v.literal("pitched"),
      v.literal("replied"),
      v.literal("deal_created"),
      v.literal("closed"),
    ),
  },
  handler: async (ctx, { prospectId, status }) => {
    const prospect = await ctx.db.get(prospectId);
    if (!prospect) throw new Error("Prospect not found");
    await ctx.db.patch(prospectId, { status });
  },
});

// ─── Get Prospect ────────────────────────────────────────────────
export const get = query({
  args: { prospectId: v.id("prospects") },
  handler: async (ctx, { prospectId }) => {
    const prospect = await ctx.db.get(prospectId);
    if (!prospect) return null;

    const pitches = await ctx.db
      .query("pitches")
      .withIndex("by_prospect", (q) => q.eq("prospectId", prospectId))
      .take(10);

    return { prospect, pitches };
  },
});

// ─── List Prospects by Campaign ──────────────────────────────────
export const listByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("prospects")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
      .take(50);
  },
});
