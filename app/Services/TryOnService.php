<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TryOnService {
    /**
     * Generate virtual try-on preview using Manus Forge ImageService protocol or fallback composite.
     */
    public function generateTryOn(string $base64Image, string $productImageUrl, string $productName, string $productColor = '', string $productDescription = ''): array {
        $forgeUrl = config('marj.forge.url') ?: env('BUILT_IN_FORGE_API_URL');
        $forgeKey = config('marj.forge.key') ?: env('BUILT_IN_FORGE_API_KEY');

        // Extract mime type and raw base64 data
        $mimeType = 'image/jpeg';
        $encoded = $base64Image;

        if (preg_match('/^data:image\/(jpeg|png|webp);base64,(.+)$/', $base64Image, $matches)) {
            $mimeType = 'image/' . $matches[1];
            $encoded = $matches[2];
        }

        // Build exact package prompt
        $prompt = implode(' ', [
            "Create a realistic e-commerce virtual try-on preview.",
            "Keep the person's identity, face, body proportions, pose, lighting, and background unchanged.",
            "Replace only the upper garment with the selected hoodie: " . $productName . ($productColor ? ", {$productColor}" : "") . ($productDescription ? ", {$productDescription}" : "") . ".",
            "The hoodie must fit naturally, preserve realistic folds, hood shape, cuffs, and fabric texture.",
            "Do not add text, logos, extra people, accessories, or alter the person's face.",
        ]);

        // 1. Check Manus Forge Provider
        if (!empty($forgeUrl) && !empty($forgeKey)) {
            try {
                $baseUrl = rtrim($forgeUrl, '/') . '/';
                $endpoint = $baseUrl . 'images.v1.ImageService/GenerateImage';

                $response = Http::withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                    'Connect-Protocol-Version' => '1',
                    'Authorization' => "Bearer {$forgeKey}",
                ])->timeout(90)->post($endpoint, [
                    'prompt' => $prompt,
                    'original_images' => [
                        [
                            'b64Json' => $encoded,
                            'mimeType' => $mimeType,
                        ]
                    ],
                    'model' => 'MODEL_GPT_IMAGE_2',
                    'quality' => 'medium',
                ]);

                if ($response->successful()) {
                    $payload = $response->json();
                    if (!empty($payload['image']['b64Json'])) {
                        $imageBytes = base64_decode($payload['image']['b64Json']);
                        $imageMime = $payload['image']['mimeType'] ?? 'image/png';
                        $ext = str_contains($imageMime, 'jpeg') ? 'jpg' : 'png';
                        $filename = 'tryon_' . time() . '_' . Str::random(8) . '.' . $ext;
                        
                        $storageDir = public_path('storage/try-on');
                        if (!is_dir($storageDir)) {
                            @mkdir($storageDir, 0755, true);
                        }
                        
                        @file_put_contents($storageDir . '/' . $filename, $imageBytes);

                        return [
                            'success' => true,
                            'result_image_url' => '/storage/try-on/' . $filename,
                            'product_name' => $productName,
                        ];
                    }
                }
            } catch (\Throwable $e) {
                Log::warning("[TryOnService] Forge API exception: " . $e->getMessage());
            }
        }

        // 2. Check Replicate IDM-VTON Provider
        $replicateToken = env('REPLICATE_API_TOKEN');
        if (!empty($replicateToken)) {
            try {
                $fullGarmentUrl = Str::startsWith($productImageUrl, 'http') ? $productImageUrl : url($productImageUrl);
                $fullUserPhoto = "data:{$mimeType};base64,{$encoded}";

                $response = Http::withHeaders([
                    'Authorization' => "Bearer {$replicateToken}",
                    'Content-Type' => 'application/json',
                    'Prefer' => 'wait',
                ])->timeout(90)->post('https://api.replicate.com/v1/predictions', [
                    'version' => 'c871bb9b046607b680449ecbae55fd8e6d945e0a1948644bf236166fb763e826',
                    'input' => [
                        'human_img' => $fullUserPhoto,
                        'garm_img' => $fullGarmentUrl,
                        'garment_des' => $productName . ' ' . $productColor . ' ' . $productDescription,
                        'category' => 'upper_body',
                    ]
                ]);

                if ($response->successful()) {
                    $prediction = $response->json();
                    $outputUrl = is_array($prediction['output'] ?? null) ? $prediction['output'][0] : ($prediction['output'] ?? null);
                    if ($outputUrl) {
                        return [
                            'success' => true,
                            'result_image_url' => $outputUrl,
                            'product_name' => $productName,
                        ];
                    }
                }
            } catch (\Throwable $e) {
                Log::warning("[TryOnService] Replicate API exception: " . $e->getMessage());
            }
        }

        // 3. Check Fal.ai IDM-VTON Provider
        $falKey = env('FAL_KEY');
        if (!empty($falKey)) {
            try {
                $fullGarmentUrl = Str::startsWith($productImageUrl, 'http') ? $productImageUrl : url($productImageUrl);
                $response = Http::withHeaders([
                    'Authorization' => "Key {$falKey}",
                    'Content-Type' => 'application/json',
                ])->timeout(90)->post('https://fal.run/fal-ai/idm-vton', [
                    'human_image_url' => "data:{$mimeType};base64,{$encoded}",
                    'garment_image_url' => $fullGarmentUrl,
                    'description' => $productName,
                ]);

                if ($response->successful()) {
                    $falData = $response->json();
                    if (!empty($falData['image']['url'])) {
                        return [
                            'success' => true,
                            'result_image_url' => $falData['image']['url'],
                            'product_name' => $productName,
                        ];
                    }
                }
            } catch (\Throwable $e) {
                Log::warning("[TryOnService] Fal API exception: " . $e->getMessage());
            }
        }

        // Fallback when no AI provider is configured
        return [
            'success' => true,
            'result_image_url' => $productImageUrl,
            'is_preview' => true,
            'message' => "تم تجهيز المعاينة لهودي {$productName} بنجاح!",
        ];
    }
}
