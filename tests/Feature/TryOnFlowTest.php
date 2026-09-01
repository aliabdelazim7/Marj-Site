<?php

namespace Tests\Feature;

use App\Models\CatalogProduct;
use App\Models\ProductCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TryOnFlowTest extends TestCase {
    use RefreshDatabase;

    public function test_try_on_validation_requires_product_and_image(): void {
        $response = $this->postJson(route('try-on.generate'), []);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['product_id', 'image_base64']);
    }

    public function test_try_on_fails_for_non_existent_product(): void {
        $response = $this->postJson(route('try-on.generate'), [
            'product_id' => 99999,
            'image_base64' => 'data:image/jpeg;base64,' . base64_encode('photo'),
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['product_id']);
    }

    public function test_try_on_succeeds_for_valid_product(): void {
        $category = ProductCategory::create([
            'name' => 'هوديز',
            'slug' => 'hoodies',
            'status' => 'active',
        ]);

        $product = CatalogProduct::create([
            'name' => 'Signal Red',
            'name_arabic' => 'إشارة حمراء',
            'slug' => 'signal-red-hoodie',
            'description' => 'هودي قطن مصري ثقيل 420gsm',
            'short_description' => 'هودي أحمر ثقيل',
            'sku' => 'MRJ-SR-001',
            'price' => 899,
            'category' => 'هوديز',
            'category_id' => $category->id,
            'image_url' => '/manus-storage/signal-red-front_ea8ae7ae.jpg',
            'status' => 'active',
        ]);

        $response = $this->postJson(route('try-on.generate'), [
            'product_id' => $product->id,
            'image_base64' => 'data:image/jpeg;base64,' . base64_encode('photo-content'),
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['success', 'result_image_url']);
        $this->assertTrue($response->json('success'));
    }
}
