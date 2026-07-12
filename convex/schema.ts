import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  freelancers: defineTable({
    name: v.string(),
    email: v.string(),
    role: v.string(),
    primaryOffer: v.string(),
    idealClient: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  campaigns: defineTable({
    freelancerId: v.id("freelancers"),
    offer: v.string(),
    idealClient: v.string(),
    objective: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("awaiting_payment"),
      v.literal("active"),
    ),
    activationPaymentId: v.optional(v.id("payments")),
    createdAt: v.number(),
    activatedAt: v.optional(v.number()),
  }).index("by_freelancer", ["freelancerId"]),

  payments: defineTable({
    campaignId: v.id("campaigns"),
    kind: v.union(v.literal("campaign_activation"), v.literal("client_deposit")),
    provider: v.literal("dodo"),
    providerPaymentId: v.string(),
    amountPaise: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("created"),
      v.literal("pending"),
      v.literal("succeeded"),
      v.literal("failed"),
    ),
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_provider_payment", ["providerPaymentId"]),
});
