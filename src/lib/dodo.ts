export type DodoConfig = {
  apiKey: string;
  activationProductId: string;
};

export function getDodoConfig(
  environment: Record<string, string | undefined> = process.env,
): DodoConfig {
  const apiKey = environment.DODO_PAYMENTS_API_KEY;
  const activationProductId = environment.DODO_ACTIVATION_PRODUCT_ID;

  if (!apiKey) throw new Error("DODO_PAYMENTS_API_KEY is required");
  if (!activationProductId) throw new Error("DODO_ACTIVATION_PRODUCT_ID is required");

  return { apiKey, activationProductId };
}
