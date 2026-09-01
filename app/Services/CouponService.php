<?php

namespace App\Services;

use App\Models\Coupon;

class CouponService {
    public function applyCoupon(string $code, int $subtotal): int {
        $coupon = Coupon::where('code', trim($code))->first();

        if (!$coupon || !$coupon->isValidForSubtotal($subtotal)) {
            return 0;
        }

        $discount = $coupon->calculateDiscount($subtotal);
        $coupon->increment('used_count');

        return $discount;
    }

    public function validateCoupon(string $code, int $subtotal): array {
        $coupon = Coupon::where('code', trim($code))->first();

        if (!$coupon) {
            return ['valid' => false, 'message' => 'كود الخصم غير موجود.'];
        }

        if (!$coupon->enabled) {
            return ['valid' => false, 'message' => 'هذا الكوبون معطل حالياً.'];
        }

        if (now()->lt($coupon->starts_at)) {
            return ['valid' => false, 'message' => 'هذا الكوبون لم يبدأ بعد.'];
        }

        if ($coupon->expires_at && now()->gt($coupon->expires_at)) {
            return ['valid' => false, 'message' => 'انتهت صلاحية هذا الكوبون.'];
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return ['valid' => false, 'message' => 'تم استنفاد الحد الأقصى لاستخدام الكوبون.'];
        }

        if ($subtotal < $coupon->minimum_subtotal) {
            return ['valid' => false, 'message' => "الحد الأدنى للطلب لتفعيل الكوبون هو {$coupon->minimum_subtotal} ج.م."];
        }

        $discount = $coupon->calculateDiscount($subtotal);

        return [
            'valid' => true,
            'discount' => $discount,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => $coupon->value,
            'message' => 'تم تطبيق كود الخصم بنجاح!',
        ];
    }
}
