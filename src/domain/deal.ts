export type DealStatus =
  | "draft"
  | "proposal_sent"
  | "awaiting_deposit"
  | "in_progress"
  | "midpoint_due"
  | "delivery_due"
  | "completed";

export type Deal = {
  id: string;
  status: DealStatus;
  totalAmount: number;
};

export type DepositPayment = {
  dealId: string;
  paymentId: string;
  status: "pending" | "succeeded";
  paidAt: Date;
};

/**
 * Valid deal state transitions.
 * Enforces a strict linear pipeline.
 */
const VALID_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  draft: ["proposal_sent"],
  proposal_sent: ["awaiting_deposit"],
  awaiting_deposit: ["in_progress"],
  in_progress: ["midpoint_due"],
  midpoint_due: ["delivery_due"],
  delivery_due: ["completed"],
  completed: [],
};

/**
 * Advances a deal to the next status.
 * Pure function — no side effects, no DB calls.
 */
export function advanceDeal(deal: Deal, targetStatus: DealStatus): Deal {
  const validNext = VALID_TRANSITIONS[deal.status];

  if (!validNext || !validNext.includes(targetStatus)) {
    throw new Error(
      `Invalid deal transition: "${deal.status}" → "${targetStatus}"`,
    );
  }

  return {
    ...deal,
    status: targetStatus,
  };
}

/**
 * Activates a deal after deposit payment is confirmed.
 * Enforces: only awaiting_deposit → in_progress on confirmed payment.
 */
export function activateDealOnDeposit(
  deal: Deal,
  payment: DepositPayment,
): Deal {
  if (deal.id !== payment.dealId) {
    throw new Error("Payment deal does not match deal");
  }

  if (deal.status !== "awaiting_deposit") {
    throw new Error(
      `Only awaiting-deposit deals can be activated. Current: "${deal.status}"`,
    );
  }

  if (payment.status !== "succeeded") {
    throw new Error("Only confirmed payments can activate a deal");
  }

  return {
    ...deal,
    status: "in_progress",
  };
}

/**
 * Creates the standard milestone split for a deal.
 * Returns labels with percentages and calculated amounts.
 */
export function createMilestonePlan(totalAmount: number) {
  return [
    {
      sequence: 1,
      label: "Deposit",
      percentage: 20,
      amount: Math.round((totalAmount * 20) / 100),
    },
    {
      sequence: 2,
      label: "Midpoint",
      percentage: 40,
      amount: Math.round((totalAmount * 40) / 100),
    },
    {
      sequence: 3,
      label: "Delivery",
      percentage: 40,
      amount: Math.round((totalAmount * 40) / 100),
    },
  ];
}
