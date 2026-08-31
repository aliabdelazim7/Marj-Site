<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderLifecycleAndFulfillmentTest extends TestCase {
    use RefreshDatabase;

    protected User $admin;
    protected Order $order;

    protected function setUp(): void {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();

        $this->order = Order::create([
            'order_number' => 'MRJ-LC-001',
            'status' => 'pending',
            'customer_name' => 'محمود سمير',
            'email' => 'mahmoud@example.com',
            'phone' => '01098765432',
            'address' => 'الدقي، الجيزة',
            'city' => 'الجيزة',
            'payment_method' => 'cod',
            'subtotal' => 899,
            'shipping' => 45,
            'total' => 944,
        ]);
    }

    public function test_admin_can_update_order_status_to_shipped(): void {
        $response = $this->actingAs($this->admin)->put(route('admin.orders.update-status', $this->order->id), [
            'status' => 'shipped',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('shipped', $this->order->refresh()->status);
    }

    public function test_admin_can_update_fulfillment_tracking_details(): void {
        $response = $this->actingAs($this->admin)->put(route('admin.orders.update-fulfillment', $this->order->id), [
            'shipment_carrier' => 'Bosta Express',
            'tracking_number' => 'BST-89210382',
            'tracking_url' => 'https://bosta.co/tracking/BST-89210382',
        ]);

        $response->assertSessionHas('success');
        $this->assertEquals('Bosta Express', $this->order->refresh()->shipment_carrier);
        $this->assertEquals('BST-89210382', $this->order->refresh()->tracking_number);
    }
}
