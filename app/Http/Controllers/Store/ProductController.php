<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Models\ProductCategory;
use Illuminate\Http\Request;

class ProductController extends Controller {
    public function index(Request $request) {
        $query = CatalogProduct::published()->with(['variants', 'media']);

        // تصنيف
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // بحث
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('name_arabic', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // فلترة المقاس
        if ($request->filled('size')) {
            $size = $request->size;
            $query->whereHas('variants', function ($q) use ($size) {
                $q->where('size', $size)->where('stock', '>', 0);
            });
        }

        // فلترة السعر
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (int) $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (int) $request->max_price);
        }

        // ترتيب
        $sort = $request->get('sort', 'newest');
        match($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'popular' => $query->orderBy('featured', 'desc')->latest(),
            default => $query->latest(),
        };

        $products = $query->paginate(12)->withQueryString();
        $categories = ProductCategory::where('status', 'active')->get();

        return view('store.products.index', compact('products', 'categories'));
    }

    public function show(string $slug) {
        $product = CatalogProduct::published()
            ->with(['variants' => function ($q) {
                $q->where('status', 'active');
            }, 'media', 'approvedReviews'])
            ->where('slug', $slug)
            ->firstOrFail();

        $relatedProducts = CatalogProduct::published()
            ->where('id', '!=', $product->id)
            ->where('category', $product->category)
            ->take(4)
            ->get();

        return view('store.products.show', compact('product', 'relatedProducts'));
    }
}
