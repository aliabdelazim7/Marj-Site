<?php

namespace Tests\Unit;

use App\Models\Coupon;
use App\Services\CouponService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponServiceTest extends TestCase {
    use RefreshDatabase;

    protected CouponService $service;

    protected function setUp(): void {
        parent::setUp();
        $this->service = new CouponService();
    }

    public function test_percentage_coupon_calculates_correct_discount(): void {
        $coupon = Coupon::create([
            'code' => 'SUMMER20',
            'type' => 'percentage',
            'value' => 20,
            'minimum_subtotal' => 500,
            'starts_at' => now()->subDay(),
            'enabled' => true,
        ]);

        $result = $this->service->validateCoupon('SUMMER20', 1000);

        $this->assertTrue($result['valid']);
        $this->assertEquals(200, $result['discount']);
    }

    public function test_fixed_coupon_calculates_correct_discount(): void {
        $coupon = Coupon::create([
            'code' => 'SAVE150',
            'type' => 'fixed',
            'value' => 150,
            'minimum_subtotal' => 800,
            'starts_at' => now()->subDay(),
            'enabled' => true,
        ]);

        $result = $this->service->validateCoupon('SAVE150', 1000);

        $this->assertTrue($result['valid']);
        $this->assertEquals(150, $result['discount']);
    }

    public function test_expired_coupon_is_rejected(): void {
        Coupon::create([
            'code' => 'EXPIRED',
            'type' => 'percentage',
            'value' => 10,
            'starts_at' => now()->subDays(10),
            'expires_at' => now()->subDay(),
            'enabled' => true,
        ]);

        $result = $this->service->validateCoupon('EXPIRED', 1000);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('انتهت صلاحية', $result['message']);
    }

    public function test_disabled_coupon_is_rejected(): void {
        Coupon::create([
            'code' => 'DISABLED',
            'type' => 'percentage',
            'value' => 10,
            'starts_at' => now()->subDay(),
            'enabled' => false,
        ]);

        $result = $this->service->validateCoupon('DISABLED', 1000);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('معطل', $result['message']);
    }

    public function test_coupon_with_usage_limit_reached_is_rejected(): void {
        Coupon::create([
            'code' => 'LIMITED',
            'type' => 'percentage',
            'value' => 10,
            'usage_limit' => 5,
            'used_count' => 5,
            'starts_at' => now()->subDay(),
            'enabled' => true,
        ]);

        $result = $this->service->validateCoupon('LIMITED', 1000);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('استنفاد', $result['message']);
    }

    public function test_apply_coupon_increments_used_count(): void {
        $coupon = Coupon::create([
            'code' => 'USEME',
            'type' => 'fixed',
            'value' => 50,
            'used_count' => 0,
            'starts_at' => now()->subDay(),
            'enabled' => true,
        ]);

        $discount = $this->service->applyCoupon('USEME', 500);

        $this->assertEquals(50, $discount);
        $this->assertEquals(1, $coupon->refresh()->used_count);
    }
}
