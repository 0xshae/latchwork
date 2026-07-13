export type CampaignStatus =
  | "draft"
  | "awaiting_payment"
  | "active"
  | "researching"
  | "completed"
  | "paused";

export type Campaign = {
  id: string;
  status: CampaignStatus;
  activationPaymentId: string | null;
  activatedAt: Date | null;
};

export type ActivationPayment = {
  campaignId: string;
  paymentId: string;
  status: "pending" | "succeeded";
  paidAt: Date;
};

/**
 * Activates a campaign after payment confirmation.
 * Pure function — enforces:
 *   - Payment must match the campaign
 *   - Campaign must be in awaiting_payment
 *   - Payment must have succeeded
 */
export function activateCampaign(
  campaign: Campaign,
  payment: ActivationPayment,
): Campaign {
  if (campaign.id !== payment.campaignId) {
    throw new Error("Payment campaign does not match campaign");
  }

  if (campaign.status !== "awaiting_payment") {
    throw new Error("Only awaiting-payment campaigns can be activated");
  }

  if (payment.status !== "succeeded") {
    throw new Error("Only confirmed payments can activate a campaign");
  }

  return {
    ...campaign,
    status: "active",
    activationPaymentId: payment.paymentId,
    activatedAt: payment.paidAt,
  };
}

/**
 * Moves a campaign to awaiting_payment when checkout is created.
 */
export function requestPayment(campaign: Campaign): Campaign {
  if (campaign.status !== "draft") {
    throw new Error(
      `Only draft campaigns can request payment. Current: "${campaign.status}"`,
    );
  }

  return {
    ...campaign,
    status: "awaiting_payment",
  };
}
