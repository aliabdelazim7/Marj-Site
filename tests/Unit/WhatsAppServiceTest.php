<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Services\WhatsAppService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WhatsAppServiceTest extends TestCase {
    use RefreshDatabase;

    protected WhatsAppService $service;

    protected function setUp(): void {
        parent::setUp();
        $this->service = new WhatsAppService();
    }

    public function test_generates_valid_order_confirmation_url(): void {
        $order = Order::create([
            'order_number' => 'MRJ-99201',
            'status' => 'pending',
            'customer_name' => 'محمد أحمد',
            'email' => 'mohamed@example.com',
            'phone' => '01012345678',
            'address' => 'مدينة نصر',
            'city' => 'القاهرة',
            'payment_method' => 'cod',
            'subtotal' => 899,
            'shipping' => 45,
            'total' => 944,
        ]);

        $url = $this->service->generateOrderConfirmationUrl($order);

        $this->assertStringStartsWith('https://wa.me/', $url);
        $this->assertStringContainsString('MRJ-99201', urldecode($url));
        $this->assertStringContainsString('محمد أحمد', urldecode($url));
        $this->assertStringContainsString('944', urldecode($url));
    }

    public function test_generates_valid_manual_payment_receipt_url(): void {
        $order = Order::create([
            'order_number' => 'MRJ-88123',
            'status' => 'pending',
            'customer_name' => 'سارة محمود',
            'email' => 'sara@example.com',
            'phone' => '01123456789',
            'address' => 'سموحة',
            'city' => 'الإسكندرية',
            'payment_method' => 'manual_transfer',
            'subtotal' => 849,
            'shipping' => 55,
            'total' => 904,
        ]);

        $url = $this->service->generateManualPaymentReceiptUrl($order, '01012345678');

        $this->assertStringStartsWith('https://wa.me/01012345678', $url);
        $this->assertStringContainsString('MRJ-88123', urldecode($url));
        $this->assertStringContainsString('904', urldecode($url));
    }
}
