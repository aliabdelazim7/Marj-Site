<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Models\LookbookEntry;
use App\Models\ProductReview;
use App\Models\StoreSetting;

class HomeController extends Controller {
    public function index() {
        $featuredProducts = CatalogProduct::published()
            ->with(['variants', 'media'])
            ->where('featured', true)
            ->take(4)
            ->get();

        if ($featuredProducts->isEmpty()) {
            $featuredProducts = CatalogProduct::published()
                ->with(['variants', 'media'])
                ->take(4)
                ->get();
        }

        $lookbookEntries = LookbookEntry::where('published', true)
            ->orderBy('sort_order')
            ->take(6)
            ->get();

        $reviews = ProductReview::where('status', 'approved')
            ->with('product')
            ->latest()
            ->take(6)
            ->get();

        return view('store.home', compact('featuredProducts', 'lookbookEntries', 'reviews'));
    }

    public function policies() {
        $settings = StoreSetting::current();
        return view('store.policies', compact('settings'));
    }
}
