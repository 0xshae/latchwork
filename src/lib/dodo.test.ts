import { describe, expect, it } from "vitest";

import { getDodoConfig } from "./dodo";

describe("getDodoConfig", () => {
  it("rejects activation checkout when Dodo configuration is incomplete", () => {
    expect(() => getDodoConfig({ DODO_PAYMENTS_API_KEY: "secret" })).toThrow(
      "DODO_ACTIVATION_PRODUCT_ID is required",
    );
  });
});
