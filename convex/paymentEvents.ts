import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Record Payment Event ────────────────────────────────────────
// Append-only log. Never modify after creation.
// Idempotent: skips if providerPaymentId already recorded.
export const record = mutation({
  args: {
    providerPaymentId: v.string(),
    purpose: v.union(
      v.literal("campaign_activation"),
      v.literal("milestone_deposit"),
      v.literal("milestone_payment"),
    ),
    campaignId: v.optional(v.id("campaigns")),
    milestoneId: v.optional(v.id("milestones")),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
    ),
    rawEventId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotent check: don't record duplicate events
    const existing = await ctx.db
      .query("paymentEvents")
      .withIndex("by_providerPaymentId", (q) =>
        q.eq("providerPaymentId", args.providerPaymentId),
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("paymentEvents", {
      provider: "dodo",
      providerPaymentId: args.providerPaymentId,
      purpose: args.purpose,
      campaignId: args.campaignId,
      milestoneId: args.milestoneId,
      amount: args.amount,
      currency: args.currency,
      status: args.status,
      receivedAt: Date.now(),
      rawEventId: args.rawEventId,
    });
  },
});

// ─── List by Campaign ────────────────────────────────────────────
export const listByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("paymentEvents")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
      .take(50);
  },
});

// ─── List by Milestone ───────────────────────────────────────────
export const listByMilestone = query({
  args: { milestoneId: v.id("milestones") },
  handler: async (ctx, { milestoneId }) => {
    return await ctx.db
      .query("paymentEvents")
      .withIndex("by_milestone", (q) => q.eq("milestoneId", milestoneId))
      .take(10);
  },
});
