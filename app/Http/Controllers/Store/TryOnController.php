<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Services\TryOnService;
use Illuminate\Http\Request;

class TryOnController extends Controller {
    public function __construct(protected TryOnService $tryOnService) {}

    public function generate(Request $request) {
        $request->validate([
            'product_id' => 'required|exists:catalog_products,id',
            'image_base64' => 'required|string',
        ]);

        $product = CatalogProduct::findOrFail($request->product_id);

        $result = $this->tryOnService->generateTryOn(
            base64Image: $request->image_base64,
            productImageUrl: $product->image_url,
            productName: $product->nameArabic
        );

        return response()->json($result);
    }
}
