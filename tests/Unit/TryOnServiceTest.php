<?php

namespace Tests\Unit;

use App\Services\TryOnService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TryOnServiceTest extends TestCase {
    protected TryOnService $service;

    protected function setUp(): void {
        parent::setUp();
        $this->service = new TryOnService();
    }

    public function test_fallback_preview_returns_product_image_when_forge_unconfigured(): void {
        config(['marj.forge.url' => null, 'marj.forge.key' => null]);

        $result = $this->service->generateTryOn(
            base64Image: 'data:image/jpeg;base64,' . base64_encode('sample-user-image'),
            productImageUrl: '/manus-storage/signal-red-front_ea8ae7ae.jpg',
            productName: 'إشارة حمراء',
            productColor: 'أحمر إشارة',
            productDescription: 'هودي قطن مصري ثقيل'
        );

        $this->assertTrue($result['success']);
        $this->assertTrue($result['is_preview']);
        $this->assertEquals('/manus-storage/signal-red-front_ea8ae7ae.jpg', $result['result_image_url']);
    }

    public function test_forge_generation_succeeds_with_valid_api_response(): void {
        config([
            'marj.forge.url' => 'https://api.manus.im',
            'marj.forge.key' => 'test-forge-key',
        ]);

        $fakeGeneratedBase64 = base64_encode('fake-generated-image-content');

        Http::fake([
            'https://api.manus.im/images.v1.ImageService/GenerateImage' => Http::response([
                'image' => [
                    'b64Json' => $fakeGeneratedBase64,
                    'mimeType' => 'image/png',
                ],
            ], 200),
        ]);

        $result = $this->service->generateTryOn(
            base64Image: 'data:image/jpeg;base64,' . base64_encode('sample-user-image'),
            productImageUrl: '/manus-storage/signal-red-front_ea8ae7ae.jpg',
            productName: 'إشارة حمراء'
        );

        $this->assertTrue($result['success']);
        $this->assertStringContainsString('/storage/try-on/', $result['result_image_url']);
    }
}
