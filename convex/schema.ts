import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Freelancer ────────────────────────────────────────────────
  // The user profile for an independent professional.
  freelancers: defineTable({
    userId: v.optional(v.string()), // auth provider subject, linked after signup
    name: v.string(),
    email: v.string(),
    role: v.string(),
    services: v.array(v.string()),
    skills: v.array(v.string()),
    portfolioUrl: v.optional(v.string()),
    primaryOffer: v.string(),
    idealClient: v.string(),
    projectMinimumAmount: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_userId", ["userId"]),

  // ─── Campaign ──────────────────────────────────────────────────
  // A funded research campaign targeting a specific client profile.
  campaigns: defineTable({
    freelancerId: v.id("freelancers"),
    name: v.optional(v.string()),
    offer: v.string(),
    idealClient: v.string(),
    targetDescription: v.optional(v.string()),
    objective: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("awaiting_payment"),
      v.literal("active"),
      v.literal("researching"),
      v.literal("completed"),
      v.literal("paused"),
    ),
    activationPaymentId: v.optional(v.id("payments")),
    createdAt: v.number(),
    activatedAt: v.optional(v.number()),
  }).index("by_freelancer", ["freelancerId"]),

  // ─── Prospect ──────────────────────────────────────────────────
  // A researched potential client for a campaign.
  prospects: defineTable({
    campaignId: v.id("campaigns"),
    companyName: v.string(),
    companyUrl: v.optional(v.string()),
    contactName: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    researchSummary: v.string(),
    fitScore: v.number(),
    fitReasoning: v.string(),
    status: v.union(
      v.literal("identified"),
      v.literal("reviewed"),
      v.literal("approved"),
      v.literal("pitched"),
      v.literal("replied"),
      v.literal("deal_created"),
      v.literal("closed"),
    ),
    createdAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_campaign_and_status", ["campaignId", "status"]),

  // ─── Pitch ─────────────────────────────────────────────────────
  // A tailored outreach message for a prospect.
  pitches: defineTable({
    prospectId: v.id("prospects"),
    campaignId: v.id("campaigns"),
    subject: v.optional(v.string()),
    body: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("approved"),
      v.literal("sent"),
    ),
    createdAt: v.number(),
    approvedAt: v.optional(v.number()),
  })
    .index("by_prospect", ["prospectId"])
    .index("by_campaign", ["campaignId"]),

  // ─── Deal ──────────────────────────────────────────────────────
  // A scoped project with milestone payment plan.
  deals: defineTable({
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
    status: v.union(
      v.literal("draft"),
      v.literal("proposal_sent"),
      v.literal("awaiting_deposit"),
      v.literal("in_progress"),
      v.literal("midpoint_due"),
      v.literal("delivery_due"),
      v.literal("completed"),
    ),
    proposalToken: v.optional(v.string()), // unique token for public proposal URL
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_freelancer", ["freelancerId"])
    .index("by_prospect", ["prospectId"])
    .index("by_proposalToken", ["proposalToken"]),

  // ─── Milestone ─────────────────────────────────────────────────
  // A payment checkpoint within a deal (e.g., 20% deposit).
  milestones: defineTable({
    dealId: v.id("deals"),
    sequence: v.number(), // 1, 2, 3
    label: v.string(), // "Deposit", "Midpoint", "Delivery"
    percentage: v.number(), // 20, 40, 40
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("checkout_created"),
      v.literal("paid"),
    ),
    paymentLink: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  }).index("by_deal", ["dealId"]),

  // ─── Payment Events ────────────────────────────────────────────
  // Immutable, auditable log of all payment activity.
  // Never modified after creation — append-only.
  paymentEvents: defineTable({
    provider: v.literal("dodo"),
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
    receivedAt: v.number(),
    rawEventId: v.optional(v.string()),
  })
    .index("by_providerPaymentId", ["providerPaymentId"])
    .index("by_campaign", ["campaignId"])
    .index("by_milestone", ["milestoneId"]),

  // ─── Payments (legacy activation tracking) ─────────────────────
  // Tracks checkout creation for campaign activation.
  payments: defineTable({
    campaignId: v.id("campaigns"),
    kind: v.union(
      v.literal("campaign_activation"),
      v.literal("client_deposit"),
      v.literal("milestone_payment"),
    ),
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
