<?php

namespace Tests\Feature;

use App\Models\ShippingZone;
use App\Models\StoreSetting;
use App\Services\ShippingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingCalculationTest extends TestCase {
    use RefreshDatabase;

    public function test_free_shipping_applied_when_subtotal_exceeds_threshold(): void {
        StoreSetting::create([
            'brand_name' => 'مرج',
            'shipping_scope' => 'جميع محافظات مصر',
            'shipping_fee' => 50,
            'free_shipping_threshold' => 2000,
            'shipping_notice' => 'شحن سريع',
            'return_policy' => '14 يوم',
            'payment_notice' => 'الدفع عند الاستلام',
        ]);

        ShippingZone::create([
            'governorate' => 'القاهرة',
            'fee' => 45,
            'enabled' => true,
        ]);

        $service = new ShippingService();

        // فوق الحد
        $feeOver = $service->calculateShipping('القاهرة', 2500);
        $this->assertEquals(0, $feeOver);

        // تحت الحد
        $feeUnder = $service->calculateShipping('القاهرة', 1000);
        $this->assertEquals(45, $feeUnder);
    }
}
