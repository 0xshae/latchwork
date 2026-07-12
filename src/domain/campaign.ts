export type CampaignStatus = "awaiting_payment" | "active";

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
