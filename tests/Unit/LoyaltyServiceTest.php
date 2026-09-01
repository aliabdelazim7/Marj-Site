<?php

namespace Tests\Unit;

use App\Models\LoyaltyAccount;
use App\Models\Order;
use App\Models\User;
use App\Services\LoyaltyService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoyaltyServiceTest extends TestCase {
    use RefreshDatabase;

    protected LoyaltyService $service;

    protected function setUp(): void {
        parent::setUp();
        $this->service = new LoyaltyService();
    }

    public function test_awards_one_point_per_ten_egp_on_delivered_order(): void {
        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'MRJ-TEST-1',
            'user_id' => $user->id,
            'status' => 'delivered',
            'customer_name' => 'علي عبد العظيم',
            'email' => $user->email,
            'phone' => '01012345678',
            'address' => 'شارع التحرير',
            'city' => 'القاهرة',
            'payment_method' => 'cod',
            'subtotal' => 1000,
            'shipping' => 45,
            'total' => 1045,
            'loyalty_awarded' => false,
        ]);

        $awarded = $this->service->awardPointsForDeliveredOrder($order);

        $this->assertTrue($awarded);
        $this->assertTrue($order->refresh()->loyalty_awarded);

        $account = LoyaltyAccount::where('user_id', $user->id)->first();
        $this->assertNotNull($account);
        $this->assertEquals(104, $account->points); // floor(1045 / 10) = 104
    }

    public function test_does_not_award_points_twice_for_same_order(): void {
        $user = User::factory()->create();

        $order = Order::create([
            'order_number' => 'MRJ-TEST-2',
            'user_id' => $user->id,
            'status' => 'delivered',
            'customer_name' => 'علي',
            'email' => $user->email,
            'phone' => '01012345678',
            'address' => 'القاهرة',
            'city' => 'القاهرة',
            'subtotal' => 500,
            'shipping' => 45,
            'total' => 545,
            'loyalty_awarded' => true, // تم المنح مسبقاً
        ]);

        $awarded = $this->service->awardPointsForDeliveredOrder($order);
        $this->assertFalse($awarded);
    }

    public function test_redeems_points_up_to_available_balance(): void {
        $user = User::factory()->create();
        LoyaltyAccount::create(['user_id' => $user->id, 'points' => 150]);

        $discount = $this->service->redeemPoints($user->id, 100, 800);

        $this->assertEquals(100, $discount);
        $this->assertEquals(50, LoyaltyAccount::where('user_id', $user->id)->value('points'));
    }
}
