<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderTrackingController extends Controller {
    public function index(Request $request) {
        $order = null;

        if ($request->filled('order_number') && $request->filled('email')) {
            $order = Order::with('items')
                ->where('order_number', trim($request->order_number))
                ->where('email', trim($request->email))
                ->first();

            if (!$order) {
                session()->flash('error', 'لم يتم العثور على طلب بهذه البيانات. يرجى التحقق من رقم الطلب والبريد الإلكتروني.');
            }
        }

        return view('store.track-order', compact('order'));
    }
}
