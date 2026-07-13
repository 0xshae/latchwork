import { describe, expect, it } from "vitest";

import {
  activateDealOnDeposit,
  advanceDeal,
  createMilestonePlan,
  type Deal,
} from "./deal";

describe("advanceDeal", () => {
  it("advances draft → proposal_sent", () => {
    const deal: Deal = { id: "deal_1", status: "draft", totalAmount: 100000 };
    const result = advanceDeal(deal, "proposal_sent");
    expect(result.status).toBe("proposal_sent");
  });

  it("advances proposal_sent → awaiting_deposit", () => {
    const deal: Deal = {
      id: "deal_1",
      status: "proposal_sent",
      totalAmount: 100000,
    };
    const result = advanceDeal(deal, "awaiting_deposit");
    expect(result.status).toBe("awaiting_deposit");
  });

  it("rejects skipping steps (draft → in_progress)", () => {
    const deal: Deal = { id: "deal_1", status: "draft", totalAmount: 100000 };
    expect(() => advanceDeal(deal, "in_progress")).toThrow(
      'Invalid deal transition: "draft" → "in_progress"',
    );
  });

  it("rejects backward transitions", () => {
    const deal: Deal = {
      id: "deal_1",
      status: "in_progress",
      totalAmount: 100000,
    };
    expect(() => advanceDeal(deal, "draft")).toThrow(
      'Invalid deal transition: "in_progress" → "draft"',
    );
  });

  it("rejects transitions from completed", () => {
    const deal: Deal = {
      id: "deal_1",
      status: "completed",
      totalAmount: 100000,
    };
    expect(() => advanceDeal(deal, "draft")).toThrow("Invalid deal transition");
  });
});

describe("activateDealOnDeposit", () => {
  it("moves awaiting_deposit → in_progress after confirmed payment", () => {
    const deal: Deal = {
      id: "deal_1",
      status: "awaiting_deposit",
      totalAmount: 100000,
    };
    const result = activateDealOnDeposit(deal, {
      dealId: "deal_1",
      paymentId: "pay_1",
      status: "succeeded",
      paidAt: new Date("2026-07-13T10:00:00.000Z"),
    });
    expect(result.status).toBe("in_progress");
  });

  it("rejects activation with mismatched deal ID", () => {
    const deal: Deal = {
      id: "deal_1",
      status: "awaiting_deposit",
      totalAmount: 100000,
    };
    expect(() =>
      activateDealOnDeposit(deal, {
        dealId: "deal_wrong",
        paymentId: "pay_1",
        status: "succeeded",
        paidAt: new Date(),
      }),
    ).toThrow("Payment deal does not match deal");
  });

  it("rejects activation with pending payment", () => {
    const deal: Deal = {
      id: "deal_1",
      status: "awaiting_deposit",
      totalAmount: 100000,
    };
    expect(() =>
      activateDealOnDeposit(deal, {
        dealId: "deal_1",
        paymentId: "pay_1",
        status: "pending",
        paidAt: new Date(),
      }),
    ).toThrow("Only confirmed payments can activate a deal");
  });

  it("rejects activation of non-awaiting-deposit deal", () => {
    const deal: Deal = { id: "deal_1", status: "draft", totalAmount: 100000 };
    expect(() =>
      activateDealOnDeposit(deal, {
        dealId: "deal_1",
        paymentId: "pay_1",
        status: "succeeded",
        paidAt: new Date(),
      }),
    ).toThrow("Only awaiting-deposit deals can be activated");
  });
});

describe("createMilestonePlan", () => {
  it("splits into 20/40/40", () => {
    const plan = createMilestonePlan(100000);
    expect(plan).toEqual([
      { sequence: 1, label: "Deposit", percentage: 20, amount: 20000 },
      { sequence: 2, label: "Midpoint", percentage: 40, amount: 40000 },
      { sequence: 3, label: "Delivery", percentage: 40, amount: 40000 },
    ]);
  });

  it("rounds amounts correctly", () => {
    const plan = createMilestonePlan(33333);
    expect(plan[0].amount + plan[1].amount + plan[2].amount).toBeCloseTo(
      33333,
      -1,
    );
  });
});
