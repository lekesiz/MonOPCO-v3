import { describe, expect, it } from "vitest";
import { createSignatureRequest, getSignatureRequest } from "./yousign";

describe("Yousign API Integration", () => {
  it("should have YOUSIGN_API_KEY configured", () => {
    expect(process.env.YOUSIGN_API_KEY).toBeDefined();
    expect(process.env.YOUSIGN_API_KEY).not.toBe("");
  });

  it("should create a signature request", async () => {
    const signatureRequest = await createSignatureRequest({
      name: "Test Signature Request - MonOPCO v3",
      deliveryMode: "none", // Don't send emails in test
      timezone: "Europe/Paris",
    });

    expect(signatureRequest).toBeDefined();
    expect(signatureRequest.id).toBeDefined();
    expect(signatureRequest.name).toBe("Test Signature Request - MonOPCO v3");
    expect(signatureRequest.status).toBe("draft");
    expect(signatureRequest.delivery_mode).toBe("none");
  });

  it("should fetch a signature request", async () => {
    // First create a signature request
    const created = await createSignatureRequest({
      name: "Test Fetch - MonOPCO v3",
      deliveryMode: "none",
    });

    // Then fetch it
    const fetched = await getSignatureRequest(created.id);

    expect(fetched).toBeDefined();
    expect(fetched.id).toBe(created.id);
    expect(fetched.name).toBe("Test Fetch - MonOPCO v3");
    expect(fetched.status).toBe("draft");
  });
});
