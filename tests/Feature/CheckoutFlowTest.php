<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CatalogProduct;
use App\Models\ProductVariant;
use App\Models\ShippingZone;
use App\Models\StoreSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutFlowTest extends TestCase {
    use RefreshDatabase;

    protected ProductVariant $variant;

    protected function setUp(): void {
        parent::setUp();

        StoreSetting::create([
            'brand_name' => 'مرج',
            'shipping_scope' => 'جميع محافظات مصر',
            'shipping_fee' => 50,
            'free_shipping_threshold' => 2000,
            'shipping_notice' => 'الشحن سريع',
            'return_policy' => '14 يوم',
            'payment_notice' => 'الدفع عند الاستلام',
        ]);

        ShippingZone::create(['governorate' => 'القاهرة', 'fee' => 45, 'enabled' => true]);

        $product = CatalogProduct::create([
            'slug' => 'test-signal-red',
            'name' => 'Signal Red',
            'name_arabic' => 'إشارة حمراء',
            'description' => 'وصف',
            'price' => 899,
            'image_url' => '/images/red.jpg',
            'category' => 'هوديز',
            'manage_stock' => true,
            'stock_status' => 'instock',
            'status' => 'active',
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TEST-SR-L',
            'size' => 'L',
            'color' => 'أحمر',
            'stock' => 5,
            'safety_stock' => 2,
            'stock_status' => 'instock',
            'status' => 'active',
        ]);
    }

    public function test_checkout_fails_when_cart_is_empty(): void {
        $response = $this->get(route('checkout.index'));
        $response->assertRedirect(route('cart.index'));
    }

    public function test_successful_checkout_creates_order_and_decrements_inventory(): void {
        $cart = Cart::create(['session_key' => 'test_session_key_123']);
        CartItem::create(['cart_id' => $cart->id, 'variant_id' => $this->variant->id, 'quantity' => 2]);

        $response = $this->withSession(['cart_id' => $cart->id])->post(route('checkout.process'), [
            'customer_name' => 'علي عبد العظيم',
            'email' => 'ali@example.com',
            'phone' => '01012345678',
            'address' => 'شارع عباس العقاد، مدينة نصر',
            'city' => 'القاهرة',
            'payment_method' => 'cod',
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('orders', [
            'customer_name' => 'علي عبد العظيم',
            'city' => 'القاهرة',
            'payment_method' => 'cod',
            'subtotal' => 1798,
            'shipping' => 45,
            'total' => 1843,
        ]);

        $this->assertEquals(3, $this->variant->refresh()->stock);
    }
}
