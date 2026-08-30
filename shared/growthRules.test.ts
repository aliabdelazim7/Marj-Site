import { describe, expect, it } from "vitest";
import { calculateDeliveryPoints, calculateLoyaltyDiscount, validateCouponForSubtotal } from "./growthRules";

const now = new Date("2026-08-25T12:00:00.000Z");
const coupon = { code: "MARJ10", type: "percentage" as const, value: 10, minimumSubtotal: 500, usageLimit: 2, usedCount: 0, startsAt: new Date("2026-08-01"), expiresAt: new Date("2026-09-01"), enabled: true };

describe("growth commerce rules", () => {
  it("applies only an active eligible coupon and caps it to subtotal", () => {
    expect(validateCouponForSubtotal(coupon, 900, now)).toEqual({ ok: true, discount: 90, code: "MARJ10" });
    expect(validateCouponForSubtotal(coupon, 400, now).ok).toBe(false);
    expect(validateCouponForSubtotal({ ...coupon, usedCount: 2 }, 900, now).ok).toBe(false);
  });

  it("awards and redeems loyalty points with bounded balances", () => {
    expect(calculateDeliveryPoints(899)).toBe(89);
    expect(calculateLoyaltyDiscount(200, 75, 999)).toEqual({ points: 75, discount: 75 });
    expect(calculateLoyaltyDiscount(2_000, 2_000, 800)).toEqual({ points: 800, discount: 800 });
  });
});
