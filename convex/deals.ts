import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Valid deal status transitions. Enforced in advanceStatus.
const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["proposal_sent"],
  proposal_sent: ["awaiting_deposit"],
  awaiting_deposit: ["in_progress"],
  in_progress: ["midpoint_due"],
  midpoint_due: ["delivery_due"],
  delivery_due: ["completed"],
};

// ─── Create Deal ─────────────────────────────────────────────────
// Creates a deal with a scope and milestone plan.
export const create = mutation({
  args: {
    freelancerId: v.id("freelancers"),
    prospectId: v.optional(v.id("prospects")),
    campaignId: v.optional(v.id("campaigns")),
    clientName: v.string(),
    clientEmail: v.optional(v.string()),
    projectTitle: v.string(),
    brief: v.string(),
    scope: v.string(),
    totalAmount: v.number(),
    currency: v.union(v.literal("INR"), v.literal("USD")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Generate a unique proposal token for the client-facing URL
    const proposalToken = `${now}-${Math.random().toString(36).slice(2, 10)}`;

    const dealId = await ctx.db.insert("deals", {
      freelancerId: args.freelancerId,
      prospectId: args.prospectId,
      campaignId: args.campaignId,
      clientName: args.clientName,
      clientEmail: args.clientEmail,
      projectTitle: args.projectTitle,
      brief: args.brief,
      scope: args.scope,
      totalAmount: args.totalAmount,
      currency: args.currency,
      status: "draft",
      proposalToken,
      createdAt: now,
      updatedAt: now,
    });

    // Create the standard 20/40/40 milestone plan
    const splits = [
      { sequence: 1, label: "Deposit", percentage: 20 },
      { sequence: 2, label: "Midpoint", percentage: 40 },
      { sequence: 3, label: "Delivery", percentage: 40 },
    ];

    for (const split of splits) {
      await ctx.db.insert("milestones", {
        dealId,
        sequence: split.sequence,
        label: split.label,
        percentage: split.percentage,
        amount: Math.round((args.totalAmount * split.percentage) / 100),
        status: "pending",
      });
    }

    // Update prospect status if linked
    if (args.prospectId) {
      await ctx.db.patch(args.prospectId, { status: "deal_created" });
    }

    return { dealId, proposalToken };
  },
});

// ─── Advance Status ──────────────────────────────────────────────
// Moves a deal to the next valid status. Enforces the state machine.
export const advanceStatus = mutation({
  args: {
    dealId: v.id("deals"),
    targetStatus: v.union(
      v.literal("proposal_sent"),
      v.literal("awaiting_deposit"),
      v.literal("in_progress"),
      v.literal("midpoint_due"),
      v.literal("delivery_due"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, { dealId, targetStatus }) => {
    const deal = await ctx.db.get(dealId);
    if (!deal) throw new Error("Deal not found");

    const validNextStatuses = VALID_TRANSITIONS[deal.status];
    if (!validNextStatuses || !validNextStatuses.includes(targetStatus)) {
      throw new Error(
        `Invalid transition: "${deal.status}" → "${targetStatus}"`,
      );
    }

    await ctx.db.patch(dealId, {
      status: targetStatus,
      updatedAt: Date.now(),
    });
  },
});

// ─── Get Deal ────────────────────────────────────────────────────
export const get = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, { dealId }) => {
    const deal = await ctx.db.get(dealId);
    if (!deal) return null;

    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_deal", (q) => q.eq("dealId", dealId))
      .take(10);

    const freelancer = await ctx.db.get(deal.freelancerId);

    return { deal, milestones, freelancer };
  },
});

// ─── Get by Proposal Token ───────────────────────────────────────
// Public query for the client-facing proposal page.
export const getByProposalToken = query({
  args: { proposalToken: v.string() },
  handler: async (ctx, { proposalToken }) => {
    const deal = await ctx.db
      .query("deals")
      .withIndex("by_proposalToken", (q) =>
        q.eq("proposalToken", proposalToken),
      )
      .unique();

    if (!deal) return null;

    const milestones = await ctx.db
      .query("milestones")
      .withIndex("by_deal", (q) => q.eq("dealId", deal._id))
      .take(10);

    const freelancer = await ctx.db.get(deal.freelancerId);

    return {
      deal,
      milestones,
      freelancerName: freelancer?.name ?? "Unknown",
    };
  },
});

// ─── List by Freelancer ──────────────────────────────────────────
export const listByFreelancer = query({
  args: { freelancerId: v.id("freelancers") },
  handler: async (ctx, { freelancerId }) => {
    return await ctx.db
      .query("deals")
      .withIndex("by_freelancer", (q) => q.eq("freelancerId", freelancerId))
      .order("desc")
      .take(20);
  },
});
