import { describe, expect, it } from "vitest";

import { activateCampaign, type Campaign } from "./campaign";

describe("activateCampaign", () => {
  it("activates an awaiting-payment campaign exactly once after a confirmed payment", () => {
    const campaign: Campaign = {
      id: "campaign_123",
      status: "awaiting_payment",
      activationPaymentId: null,
      activatedAt: null,
    };

    const activated = activateCampaign(campaign, {
      campaignId: "campaign_123",
      paymentId: "pay_123",
      status: "succeeded",
      paidAt: new Date("2026-07-12T10:00:00.000Z"),
    });

    expect(activated).toEqual({
      id: "campaign_123",
      status: "active",
      activationPaymentId: "pay_123",
      activatedAt: new Date("2026-07-12T10:00:00.000Z"),
    });
  });
});
