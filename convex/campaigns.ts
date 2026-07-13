import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Onboard ─────────────────────────────────────────────────────
// Creates a freelancer profile and their first campaign in one step.
export const onboard = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    services: v.optional(v.array(v.string())),
    skills: v.optional(v.array(v.string())),
    portfolioUrl: v.optional(v.string()),
    primaryOffer: v.string(),
    idealClient: v.string(),
    projectMinimumAmount: v.optional(v.number()),
    objective: v.string(),
    targetDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject;

    const createdAt = Date.now();
    const freelancerId = await ctx.db.insert("freelancers", {
      userId,
      name: args.name,
      email: args.email.toLowerCase(),
      role: args.role,
      services: args.services ?? [args.primaryOffer],
      skills: args.skills ?? [],
      portfolioUrl: args.portfolioUrl,
      primaryOffer: args.primaryOffer,
      idealClient: args.idealClient,
      projectMinimumAmount: args.projectMinimumAmount,
      createdAt,
    });

    const campaignId = await ctx.db.insert("campaigns", {
      freelancerId,
      name: `Campaign for ${args.idealClient}`,
      offer: args.primaryOffer,
      idealClient: args.idealClient,
      targetDescription: args.targetDescription,
      objective: args.objective,
      status: "draft",
      createdAt,
    });

    return { campaignId, freelancerId };
  },
});

// ─── Get Campaign ────────────────────────────────────────────────
// Returns a campaign with its freelancer, payments, prospects, and deals.
export const get = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) return null;

    const freelancer = await ctx.db.get(campaign.freelancerId);

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
      .take(50);

    const prospects = await ctx.db
      .query("prospects")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
      .take(50);

    return { campaign, freelancer, payments, prospects };
  },
});

// ─── List Campaigns ──────────────────────────────────────────────
// Returns all campaigns for a freelancer, newest first.
export const listByFreelancer = query({
  args: { freelancerId: v.id("freelancers") },
  handler: async (ctx, { freelancerId }) => {
    return await ctx.db
      .query("campaigns")
      .withIndex("by_freelancer", (q) => q.eq("freelancerId", freelancerId))
      .order("desc")
      .take(20);
  },
});

// ─── Activate Campaign ──────────────────────────────────────────
// Called after a Dodo webhook confirms payment. Moves campaign to active.
// Uses the domain rule: only awaiting_payment → active on confirmed payment.
export const activate = mutation({
  args: {
    campaignId: v.id("campaigns"),
    paymentId: v.id("payments"),
  },
  handler: async (ctx, { campaignId, paymentId }) => {
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");

    if (campaign.status === "active") {
      // Idempotent: already activated
      return { alreadyActive: true };
    }

    if (campaign.status !== "awaiting_payment") {
      throw new Error(
        `Cannot activate campaign in status "${campaign.status}". Must be "awaiting_payment".`,
      );
    }

    const payment = await ctx.db.get(paymentId);
    if (!payment) throw new Error("Payment not found");

    if (payment.campaignId !== campaignId) {
      throw new Error("Payment does not match campaign");
    }

    if (payment.status !== "succeeded") {
      throw new Error("Payment has not succeeded yet");
    }

    await ctx.db.patch(campaignId, {
      status: "active",
      activationPaymentId: paymentId,
      activatedAt: Date.now(),
    });

    return { alreadyActive: false };
  },
});
