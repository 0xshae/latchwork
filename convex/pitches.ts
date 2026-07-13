import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ─── Create Pitch ────────────────────────────────────────────────
// Creates a draft pitch for a prospect. Called by the pitch writer agent.
export const create = mutation({
  args: {
    prospectId: v.id("prospects"),
    campaignId: v.id("campaigns"),
    subject: v.optional(v.string()),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const prospect = await ctx.db.get(args.prospectId);
    if (!prospect) throw new Error("Prospect not found");

    return await ctx.db.insert("pitches", {
      prospectId: args.prospectId,
      campaignId: args.campaignId,
      subject: args.subject,
      body: args.body,
      status: "draft",
      createdAt: Date.now(),
    });
  },
});

// ─── Approve Pitch ───────────────────────────────────────────────
// Freelancer approves a pitch — human-in-the-loop gate.
export const approve = mutation({
  args: {
    pitchId: v.id("pitches"),
  },
  handler: async (ctx, { pitchId }) => {
    const pitch = await ctx.db.get(pitchId);
    if (!pitch) throw new Error("Pitch not found");

    if (pitch.status !== "draft") {
      throw new Error(`Cannot approve pitch in status "${pitch.status}"`);
    }

    await ctx.db.patch(pitchId, {
      status: "approved",
      approvedAt: Date.now(),
    });

    // Also update prospect status to "approved"
    await ctx.db.patch(pitch.prospectId, { status: "approved" });
  },
});

// ─── Update Pitch Body ──────────────────────────────────────────
// Freelancer edits the pitch text before approving.
export const updateBody = mutation({
  args: {
    pitchId: v.id("pitches"),
    subject: v.optional(v.string()),
    body: v.string(),
  },
  handler: async (ctx, { pitchId, subject, body }) => {
    const pitch = await ctx.db.get(pitchId);
    if (!pitch) throw new Error("Pitch not found");

    if (pitch.status !== "draft") {
      throw new Error("Can only edit draft pitches");
    }

    await ctx.db.patch(pitchId, { subject, body });
  },
});

// ─── Mark Sent ───────────────────────────────────────────────────
export const markSent = mutation({
  args: { pitchId: v.id("pitches") },
  handler: async (ctx, { pitchId }) => {
    const pitch = await ctx.db.get(pitchId);
    if (!pitch) throw new Error("Pitch not found");

    if (pitch.status !== "approved") {
      throw new Error("Can only send approved pitches");
    }

    await ctx.db.patch(pitchId, { status: "sent" });
    await ctx.db.patch(pitch.prospectId, { status: "pitched" });
  },
});

// ─── List by Campaign ────────────────────────────────────────────
export const listByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("pitches")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
      .take(50);
  },
});

// ─── Get by Prospect ─────────────────────────────────────────────
export const getByProspect = query({
  args: { prospectId: v.id("prospects") },
  handler: async (ctx, { prospectId }) => {
    return await ctx.db
      .query("pitches")
      .withIndex("by_prospect", (q) => q.eq("prospectId", prospectId))
      .take(5);
  },
});
