<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Models\ProductCategory;
use App\Models\ProductMedia;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller {
    public function index() {
        $products = CatalogProduct::with(['variants', 'media', 'categoryModel'])
            ->latest()
            ->paginate(15);

        return view('admin.products.index', compact('products'));
    }

    public function create() {
        $categories = ProductCategory::all();
        return view('admin.products.create', compact('categories'));
    }

    public function store(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:160',
            'name_arabic' => 'required|string|max:160',
            'slug' => 'required|string|max:120|unique:catalog_products,slug',
            'description' => 'required|string|max:5000',
            'short_description' => 'nullable|string|max:500',
            'price' => 'required|integer|min:1',
            'sale_price' => 'nullable|integer|lt:price',
            'compare_at_price' => 'nullable|integer|gte:price',
            'sku' => 'nullable|string|max:80',
            'image_url' => 'required|string|max:2000',
            'category' => 'required|string|max:80',
            'category_id' => 'nullable|exists:product_categories,id',
            'featured' => 'boolean',
            'manage_stock' => 'boolean',
            'stock_status' => 'required|in:instock,outofstock,onbackorder',
            'status' => 'required|in:draft,active,archived',
        ]);

        $product = CatalogProduct::create($data);

        // إنشاء الـ Variants الافتراضية (S, M, L, XL)
        $sizes = ['S', 'M', 'L', 'XL'];
        foreach ($sizes as $size) {
            ProductVariant::create([
                'product_id' => $product->id,
                'sku' => ($product->sku ?? $product->slug) . '-' . $size,
                'size' => $size,
                'color' => 'أساسي',
                'stock' => 10,
                'safety_stock' => 3,
                'stock_status' => 'instock',
                'status' => 'active',
            ]);
        }

        return redirect()->route('admin.products.edit', $product->id)->with('success', 'تم إنشاء المنتج بنجاح مع المقاسات الافتراضية!');
    }

    public function edit(int $id) {
        $product = CatalogProduct::with(['variants', 'media'])->findOrFail($id);
        $categories = ProductCategory::all();

        return view('admin.products.edit', compact('product', 'categories'));
    }

    public function update(Request $request, int $id) {
        $product = CatalogProduct::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:160',
            'name_arabic' => 'required|string|max:160',
            'slug' => "required|string|max:120|unique:catalog_products,slug,{$id}",
            'description' => 'required|string|max:5000',
            'short_description' => 'nullable|string|max:500',
            'price' => 'required|integer|min:1',
            'sale_price' => 'nullable|integer|lt:price',
            'compare_at_price' => 'nullable|integer|gte:price',
            'sku' => 'nullable|string|max:80',
            'image_url' => 'required|string|max:2000',
            'category' => 'required|string|max:80',
            'category_id' => 'nullable|exists:product_categories,id',
            'featured' => 'boolean',
            'manage_stock' => 'boolean',
            'stock_status' => 'required|in:instock,outofstock,onbackorder',
            'status' => 'required|in:draft,active,archived',
        ]);

        $product->update($data);

        return back()->with('success', 'تم تحديث بيانات المنتج بنجاح!');
    }

    public function updateVariant(Request $request, int $variantId) {
        $variant = ProductVariant::findOrFail($variantId);

        $data = $request->validate([
            'sku' => "required|string|max:80|unique:product_variants,sku,{$variantId}",
            'size' => 'required|in:S,M,L,XL',
            'color' => 'required|string|max:80',
            'stock' => 'required|integer|min:0',
            'safety_stock' => 'required|integer|min:0',
            'price_override' => 'nullable|integer|min:1',
            'stock_status' => 'required|in:instock,outofstock,onbackorder',
            'status' => 'required|in:active,inactive',
        ]);

        $variant->update($data);

        return back()->with('success', "تم تحديث المقاس {$variant->size} بنجاح!");
    }

    public function addMedia(Request $request, int $productId) {
        $request->validate([
            'url' => 'required|string|max:2000',
            'media_type' => 'required|in:front,back,gallery,model3d',
            'alt_text' => 'nullable|string|max:180',
        ]);

        ProductMedia::create([
            'product_id' => $productId,
            'url' => $request->url,
            'media_type' => $request->media_type,
            'alt_text' => $request->alt_text,
            'sort_order' => 0,
        ]);

        return back()->with('success', 'تمت إضافة الوسيط/الصورة بنجاح!');
    }

    public function deleteMedia(int $mediaId) {
        ProductMedia::findOrFail($mediaId)->delete();
        return back()->with('success', 'تم حذف الوسيط بنجاح.');
    }
}
