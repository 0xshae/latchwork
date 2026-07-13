import { query } from "./_generated/server";

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const freelancer = await ctx.db
      .query("freelancers")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .unique();

    return freelancer;
  },
});
