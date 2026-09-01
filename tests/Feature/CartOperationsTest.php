<?php

namespace Tests\Feature;

use App\Models\CatalogProduct;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartOperationsTest extends TestCase {
    use RefreshDatabase;

    protected ProductVariant $variant;

    protected function setUp(): void {
        parent::setUp();

        $product = CatalogProduct::create([
            'slug' => 'test-hoodie',
            'name' => 'Test Hoodie',
            'name_arabic' => 'هودي اختبار',
            'description' => 'وصف تجريبي',
            'price' => 899,
            'image_url' => '/images/test.jpg',
            'category' => 'هوديز',
            'manage_stock' => true,
            'stock_status' => 'instock',
            'status' => 'active',
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TEST-M',
            'size' => 'M',
            'color' => 'أساسي',
            'stock' => 10,
            'safety_stock' => 3,
            'stock_status' => 'instock',
            'status' => 'active',
        ]);
    }

    public function test_guest_can_add_in_stock_variant_to_cart(): void {
        $response = $this->post(route('cart.add'), [
            'variant_id' => $this->variant->id,
            'quantity' => 2,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('cart_items', [
            'variant_id' => $this->variant->id,
            'quantity' => 2,
        ]);
    }

    public function test_cannot_add_out_of_stock_variant(): void {
        $this->variant->update(['stock' => 0, 'stock_status' => 'outofstock']);

        $response = $this->post(route('cart.add'), [
            'variant_id' => $this->variant->id,
            'quantity' => 1,
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('cart_items', [
            'variant_id' => $this->variant->id,
        ]);
    }

    public function test_cannot_add_quantity_exceeding_stock(): void {
        $response = $this->post(route('cart.add'), [
            'variant_id' => $this->variant->id,
            'quantity' => 15, // المخزون 10 فقط
        ]);

        $response->assertSessionHas('error');
    }
}
