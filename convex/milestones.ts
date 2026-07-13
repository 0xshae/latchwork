import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Get Milestones by Deal ──────────────────────────────────────
export const listByDeal = query({
  args: { dealId: v.id("deals") },
  handler: async (ctx, { dealId }) => {
    return await ctx.db
      .query("milestones")
      .withIndex("by_deal", (q) => q.eq("dealId", dealId))
      .take(10);
  },
});

// ─── Mark Checkout Created ───────────────────────────────────────
// Records that a Dodo checkout was created for this milestone.
export const markCheckoutCreated = mutation({
  args: {
    milestoneId: v.id("milestones"),
    paymentLink: v.string(),
    paymentId: v.string(),
  },
  handler: async (ctx, { milestoneId, paymentLink, paymentId }) => {
    const milestone = await ctx.db.get(milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    if (milestone.status !== "pending") {
      throw new Error(
        `Cannot create checkout for milestone in status "${milestone.status}"`,
      );
    }

    await ctx.db.patch(milestoneId, {
      status: "checkout_created",
      paymentLink,
      paymentId,
    });
  },
});

// ─── Mark Paid ───────────────────────────────────────────────────
// Called by the payment webhook handler after payment confirmation.
export const markPaid = mutation({
  args: {
    milestoneId: v.id("milestones"),
  },
  handler: async (ctx, { milestoneId }) => {
    const milestone = await ctx.db.get(milestoneId);
    if (!milestone) throw new Error("Milestone not found");

    if (milestone.status === "paid") {
      // Idempotent
      return;
    }

    if (milestone.status !== "checkout_created") {
      throw new Error(
        `Cannot mark paid: milestone is "${milestone.status}", expected "checkout_created"`,
      );
    }

    await ctx.db.patch(milestoneId, {
      status: "paid",
      paidAt: Date.now(),
    });
  },
});
