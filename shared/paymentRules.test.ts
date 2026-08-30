import { describe, expect, it } from "vitest";
import { getPaymentActivationError } from "./paymentRules";

describe("payment activation rules", () => {
  it("allows COD and a configured manual transfer", () => {
    expect(getPaymentActivationError("cod", true, null)).toBeNull();
    expect(getPaymentActivationError("manual_transfer", true, "حوّل إلى الرقم المعلن ثم احتفظ بإثبات التحويل.")).toBeNull();
  });

  it("blocks online cards and a manual transfer without instructions", () => {
    expect(getPaymentActivationError("online_card", true, "أي نص")).toContain("مزود دفع");
    expect(getPaymentActivationError("manual_transfer", true, " ")).toContain("تعليمات التحويل");
    expect(getPaymentActivationError("online_card", false, null)).toBeNull();
  });
});
