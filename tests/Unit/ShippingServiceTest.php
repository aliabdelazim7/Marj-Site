<?php

namespace Tests\Unit;

use App\Models\ShippingZone;
use App\Models\StoreSetting;
use App\Services\ShippingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ShippingServiceTest extends TestCase {
    use RefreshDatabase;

    protected ShippingService $service;

    protected function setUp(): void {
        parent::setUp();
        $this->service = new ShippingService();

        StoreSetting::create([
            'brand_name' => 'مرج',
            'shipping_scope' => 'جميع محافظات مصر',
            'shipping_fee' => 50,
            'free_shipping_threshold' => 2000,
            'shipping_notice' => 'الشحن سريع',
            'return_policy' => '14 يوم',
            'payment_notice' => 'عند الاستلام',
        ]);
    }

    public function test_free_shipping_granted_when_subtotal_reaches_threshold(): void {
        ShippingZone::create(['governorate' => 'القاهرة', 'fee' => 45, 'enabled' => true]);

        $fee = $this->service->calculateShipping('القاهرة', 2000);
        $this->assertEquals(0, $fee);

        $feeOver = $this->service->calculateShipping('القاهرة', 3500);
        $this->assertEquals(0, $feeOver);
    }

    public function test_specific_governorate_rate_applied_under_threshold(): void {
        ShippingZone::create(['governorate' => 'الإسكندرية', 'fee' => 55, 'enabled' => true]);

        $fee = $this->service->calculateShipping('الإسكندرية', 1200);
        $this->assertEquals(55, $fee);
    }

    public function test_fallback_to_default_store_fee_when_zone_not_configured(): void {
        $fee = $this->service->calculateShipping('محافظة غير مدرجة', 800);
        $this->assertEquals(50, $fee);
    }
}
