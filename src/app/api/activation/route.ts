import { ConvexHttpClient } from "convex/browser";
import DodoPayments from "dodopayments";
import { NextRequest, NextResponse } from "next/server";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { getDodoConfig } from "../../../lib/dodo";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
    }

    const { campaignId, email } = body as { campaignId?: string; email?: string };
    if (!campaignId || !email) {
      return NextResponse.json({ error: "campaignId and email are required" }, { status: 400 });
    }

    const { apiKey, activationProductId } = getDodoConfig();
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL is required");

    const dodo = new DodoPayments({ bearerToken: apiKey });
    const appUrl = new URL(request.url).origin;
    const checkout = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: activationProductId, quantity: 1 }],
      customer: { email },
      return_url: `${appUrl}/?activation=complete&campaign=${encodeURIComponent(campaignId)}`,
      cancel_url: `${appUrl}/?activation=cancelled&campaign=${encodeURIComponent(campaignId)}`,
      customization: { theme: "light" },
      metadata: { latchwork_campaign_id: campaignId, checkout_kind: "campaign_activation" },
    });

    if (!checkout.checkout_url) throw new Error("Dodo did not return a hosted checkout URL");

    const convex = new ConvexHttpClient(convexUrl);
    await convex.mutation(api.payments.createActivation, {
      campaignId: campaignId as Id<"campaigns">,
      providerPaymentId: checkout.payment_id ?? checkout.session_id,
    });

    return NextResponse.json({ checkoutUrl: checkout.checkout_url });
  } catch (caughtError) {
    const error = caughtError instanceof Error ? caughtError.message : "Unable to create checkout";
    return NextResponse.json({ error }, { status: 500 });
  }
}
