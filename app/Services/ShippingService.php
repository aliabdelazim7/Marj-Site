<?php

namespace App\Services;

use App\Models\ShippingZone;
use App\Models\StoreSetting;

class ShippingService {
    public function calculateShipping(string $governorate, int $subtotal): int {
        $settings = StoreSetting::current();

        // فحص حد الشحن المجاني
        if ($settings->free_shipping_threshold && $subtotal >= $settings->free_shipping_threshold) {
            return 0;
        }

        // البحث عن المحافظة المحددة
        $zone = ShippingZone::where('governorate', $governorate)
            ->where('enabled', true)
            ->first();

        if ($zone) {
            return $zone->fee;
        }

        return $settings->shipping_fee ?? 50;
    }

    public function getActiveZones() {
        return ShippingZone::active()->get();
    }
}
