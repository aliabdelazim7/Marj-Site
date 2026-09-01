<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Services\CouponService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponValidationTest extends TestCase {
    use RefreshDatabase;

    public function test_valid_percentage_coupon_applies_correct_discount(): void {
        $coupon = Coupon::create([
            'code' => 'TEST10',
            'type' => 'percentage',
            'value' => 10,
            'minimum_subtotal' => 500,
            'starts_at' => now()->subDay(),
            'enabled' => true,
        ]);

        $service = new CouponService();
        $result = $service->validateCoupon('TEST10', 1000);

        $this->assertTrue($result['valid']);
        $this->assertEquals(100, $result['discount']);
    }

    public function test_coupon_fails_when_below_minimum_subtotal(): void {
        $coupon = Coupon::create([
            'code' => 'MIN500',
            'type' => 'fixed',
            'value' => 50,
            'minimum_subtotal' => 500,
            'starts_at' => now()->subDay(),
            'enabled' => true,
        ]);

        $service = new CouponService();
        $result = $service->validateCoupon('MIN500', 300);

        $this->assertFalse($result['valid']);
    }
}
