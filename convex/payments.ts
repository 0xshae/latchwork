import { v } from "convex/values";

import { mutation } from "./_generated/server";

// ─── Create Activation Payment ───────────────────────────────────
// Records a checkout creation for campaign activation.
// Moves campaign from draft → awaiting_payment.
// Idempotent: returns existing payment if providerPaymentId already exists.
export const createActivation = mutation({
  args: {
    campaignId: v.id("campaigns"),
    providerPaymentId: v.string(),
  },
  handler: async (ctx, { campaignId, providerPaymentId }) => {
    const campaign = await ctx.db.get(campaignId);
    if (!campaign) throw new Error("Campaign not found");
    if (campaign.status === "active")
      throw new Error("Campaign is already active");

    // Idempotent: don't create duplicate payments
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_provider_payment", (q) =>
        q.eq("providerPaymentId", providerPaymentId),
      )
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

// ─── Confirm Payment ─────────────────────────────────────────────
// Called by the webhook handler after Dodo confirms a payment.
// Updates the payment status and triggers downstream effects.
export const confirmPayment = mutation({
  args: {
    providerPaymentId: v.string(),
    status: v.union(v.literal("succeeded"), v.literal("failed")),
  },
  handler: async (ctx, { providerPaymentId, status }) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_provider_payment", (q) =>
        q.eq("providerPaymentId", providerPaymentId),
      )
      .unique();

    if (!payment) throw new Error("Payment not found");

    // Idempotent: skip if already in terminal state
    if (payment.status === "succeeded" || payment.status === "failed") {
      return { paymentId: payment._id, alreadyProcessed: true };
    }

    await ctx.db.patch(payment._id, {
      status,
      paidAt: status === "succeeded" ? Date.now() : undefined,
    });

    // If this is a campaign activation and it succeeded, activate the campaign
    if (status === "succeeded" && payment.kind === "campaign_activation") {
      const campaign = await ctx.db.get(payment.campaignId);
      if (campaign && campaign.status === "awaiting_payment") {
        await ctx.db.patch(payment.campaignId, {
          status: "active",
          activationPaymentId: payment._id,
          activatedAt: Date.now(),
        });
      }
    }

    return { paymentId: payment._id, alreadyProcessed: false };
  },
});
