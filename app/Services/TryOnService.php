<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TryOnService {
    public function generateTryOn(string $base64Image, string $productImageUrl, string $productName): array {
        $forgeUrl = config('marj.forge.url');
        $forgeKey = config('marj.forge.key');

        if (!$forgeUrl || !$forgeKey) {
            return [
                'success' => false,
                'message' => 'خدمة الذكاء الاصطناعي للقياس الافتراضي تتطلب ضبط مفاتيح Forge في السيرفر.',
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$forgeKey}",
                'Content-Type' => 'application/json',
            ])->timeout(60)->post("{$forgeUrl}/v1/images/try-on", [
                'user_image_base64' => $base64Image,
                'garment_image_url' => $productImageUrl,
                'garment_description' => "Egyptian oversized heavy cotton hoodie: {$productName}",
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'result_image_url' => $data['image_url'] ?? $data['result_base64'] ?? null,
                ];
            }

            return [
                'success' => false,
                'message' => 'تعذر معالجة الصورة في الوقت الحالي، يرجى المحاولة بصورة أوضح.',
            ];
        } catch (\Throwable $e) {
            Log::error("[TryOnService] Failed: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'حدث خطأ أثناء معالجة القياس الافتراضي.',
            ];
        }
    }
}
