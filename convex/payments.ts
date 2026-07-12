import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const createActivation = mutation({
  args: {
    campaignId: v.id("campaigns"),
    providerPaymentId: v.string(),
  },
  handler: async (ctx, { campaignId, providerPaymentId }) => {
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status === "active") throw new Error("Campaign is already active");

    const existing = await ctx.db
      .query("payments")
      .withIndex("by_provider_payment", (q) => q.eq("providerPaymentId", providerPaymentId))
      .unique();
    if (existing) return existing._id;

    const paymentId = await ctx.db.insert("payments", {
      campaignId,
      kind: "campaign_activation",
      provider: "dodo",
      providerPaymentId,
      amountPaise: 19900,
      currency: "INR",
      status: "pending",
      createdAt: Date.now(),
    });

    if (campaign.status === "draft") {
      await ctx.db.patch(campaignId, { status: "awaiting_payment" });
    }

    return paymentId;
  },
});
