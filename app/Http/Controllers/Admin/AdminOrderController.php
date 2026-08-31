<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\LoyaltyService;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;

class AdminOrderController extends Controller {
    public function __construct(
        protected LoyaltyService $loyaltyService,
        protected WhatsAppService $whatsAppService
    ) {}

    public function index(Request $request) {
        $query = Order::with('items');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $orders = $query->latest()->paginate(20)->withQueryString();

        return view('admin.orders.index', compact('orders'));
    }

    public function show(int $id) {
        $order = Order::with(['items', 'user'])->findOrFail($id);
        $whatsAppStatusUrl = $this->whatsAppService->generateOrderStatusUpdateUrl($order);

        return view('admin.orders.show', compact('order', 'whatsAppStatusUrl'));
    }

    public function updateStatus(Request $request, int $id) {
        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        // إذا تم تحويل الحالة إلى Delivered يتم منح نقاط الولاء
        if ($request->status === 'delivered') {
            $this->loyaltyService->awardPointsForDeliveredOrder($order);
        }

        return back()->with('success', "تم تحديث حالة الطلب #{$order->order_number} إلى: {$order->status_arabic}");
    }

    public function updateFulfillment(Request $request, int $id) {
        $data = $request->validate([
            'shipment_carrier' => 'nullable|string|max:120',
            'tracking_number' => 'nullable|string|max:160',
            'tracking_url' => 'nullable|url|max:2000',
        ]);

        $order = Order::findOrFail($id);
        $order->update($data);

        return back()->with('success', 'تم حفظ بيانات الشحن والتتبع بنجاح!');
    }
}
