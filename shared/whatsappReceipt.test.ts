import { describe, expect, it } from "vitest";
import { buildManualPaymentWhatsAppMessage, normalizeEgyptianWhatsAppNumber } from "./whatsappReceipt";

describe("WhatsApp manual payment receipt handoff", () => {
  it("normalizes an Egyptian local number to WhatsApp international format", () => {
    expect(normalizeEgyptianWhatsAppNumber("010-1234-5678")).toBe("201012345678");
    expect(normalizeEgyptianWhatsAppNumber("+20 10 1234 5678")).toBe("201012345678");
    expect(normalizeEgyptianWhatsAppNumber("201312345678")).toBeNull();
  });

  it("builds a minimal, order-specific receipt message without an address or email", () => {
    const message = buildManualPaymentWhatsAppMessage({ orderNumber: "MRJ-2026-A1B2", total: 1498, paymentLabel: "Vodafone Cash", customerName: "سارة", customerPhone: "01012345678", items: [{ productName: "إشارة حمراء", size: "M", quantity: 1 }] });
    expect(message).toContain("MRJ-2026-A1B2");
    expect(message).toContain("Vodafone Cash");
    expect(message).toContain("Screenshot التحويل");
    expect(message).not.toContain("العنوان");
  });
});
