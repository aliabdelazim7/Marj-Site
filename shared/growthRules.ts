export type CouponLike = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minimumSubtotal: number;
  usageLimit: number | null;
  usedCount: number;
  startsAt: Date;
  expiresAt: Date | null;
  enabled: boolean;
};

export type CouponValidation = { ok: true; discount: number; code: string } | { ok: false; message: string };

export function validateCouponForSubtotal(coupon: CouponLike | null, subtotal: number, now = new Date()): CouponValidation {
  if (!coupon || !coupon.enabled) return { ok: false, message: "كود الخصم غير متاح." };
  if (coupon.startsAt.getTime() > now.getTime() || (coupon.expiresAt && coupon.expiresAt.getTime() < now.getTime())) return { ok: false, message: "كود الخصم منتهي أو لم يبدأ بعد." };
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) return { ok: false, message: "تم استخدام كود الخصم بالكامل." };
  if (subtotal < coupon.minimumSubtotal) return { ok: false, message: `يتطلب هذا الكود مشتريات بقيمة ${coupon.minimumSubtotal} جنيه على الأقل.` };
  const raw = coupon.type === "percentage" ? Math.floor((subtotal * coupon.value) / 100) : coupon.value;
  return { ok: true, discount: Math.min(subtotal, Math.max(0, raw)), code: coupon.code };
}

export const LOYALTY_POINTS_PER_EGP = 10;
export const LOYALTY_EGP_PER_POINT = 1;

export function calculateDeliveryPoints(orderTotal: number) {
  return Math.max(0, Math.floor(orderTotal / LOYALTY_POINTS_PER_EGP));
}

export function calculateLoyaltyDiscount(requestedPoints: number, availablePoints: number, subtotalAfterCoupon: number) {
  const points = Math.max(0, Math.min(Math.floor(requestedPoints), availablePoints, subtotalAfterCoupon * LOYALTY_EGP_PER_POINT));
  return { points, discount: Math.floor(points / LOYALTY_EGP_PER_POINT) };
}
