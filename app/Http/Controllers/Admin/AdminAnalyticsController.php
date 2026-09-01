<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CatalogProduct;
use App\Models\CommerceEvent;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller {
    public function index() {
        $totalSales = Order::where('status', '!=', 'cancelled')->sum('total');
        $ordersCount = Order::count();
        $deliveredOrdersCount = Order::where('status', 'delivered')->count();

        // أفضل المنتجات مبيعاً
        $topProducts = OrderItem::select('product_name', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(line_total) as total_revenue'))
            ->groupBy('product_name')
            ->orderByDesc('total_qty')
            ->take(5)
            ->get();

        // إحصائيات الأحداث
        $eventCounts = CommerceEvent::select('event_name', DB::raw('count(*) as count'))
            ->groupBy('event_name')
            ->pluck('count', 'event_name');

        return view('admin.analytics.index', compact('totalSales', 'ordersCount', 'deliveredOrdersCount', 'topProducts', 'eventCounts'));
    }
}
