import { describe, expect, it } from "vitest";
import { buildOrderStatusWhatsAppMessage, buildOrderStatusWhatsAppUrl } from "./orderStatusWhatsApp";

describe("order status WhatsApp handoff", () => {
  it("builds a truthful customer message for each status", () => {
    const message = buildOrderStatusWhatsAppMessage({ orderNumber: "MRJ-2026-A1", customerName: "سارة", total: 900, status: "shipped" });
    expect(message).toContain("تم شحن طلبك");
    expect(message).toContain("MRJ-2026-A1");
    expect(message).not.toContain("العنوان");
  });

  it("creates a WhatsApp URL only for a normalized Egyptian customer phone", () => {
    const url = buildOrderStatusWhatsAppUrl({ orderNumber: "MRJ-2026-A1", customerName: "سارة", customerPhone: "01012345678", total: 900, status: "confirmed" });
    expect(url).toContain("wa.me/201012345678");
    expect(buildOrderStatusWhatsAppUrl({ orderNumber: "MRJ-2026-A1", customerName: "سارة", customerPhone: "123", total: 900, status: "confirmed" })).toBeNull();
  });
});
