<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Models\Order;
use App\Models\ProductCategory;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller {
    public function index() {
        $totalOrders = Order::count();
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total');
        $activeProductsCount = CatalogProduct::where('status', 'active')->count();
        $draftProductsCount = CatalogProduct::where('status', 'draft')->count();

        // تنبيهات نواقص المخزون (Safety Stock)
        $lowStockVariants = ProductVariant::with('product')
            ->where('stock', '>', 0)
            ->whereColumn('stock', '<=', 'safety_stock')
            ->take(10)
            ->get();

        $outOfStockVariants = ProductVariant::with('product')
            ->where('stock', '<=', 0)
            ->take(10)
            ->get();

        $recentOrders = Order::with('items')
            ->latest()
            ->take(8)
            ->get();

        return view('admin.dashboard', compact(
            'totalOrders',
            'totalRevenue',
            'activeProductsCount',
            'draftProductsCount',
            'lowStockVariants',
            'outOfStockVariants',
            'recentOrders'
        ));
    }
}
