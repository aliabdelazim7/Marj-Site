<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\ProductReview;
use Illuminate\Http\Request;

class ReviewController extends Controller {
    public function store(Request $request) {
        $request->validate([
            'order_number' => 'required|string|min:6|max:32',
            'email' => 'required|email|max:320',
            'product_id' => 'required|exists:catalog_products,id',
            'customer_name' => 'required|string|max:160',
            'rating' => 'required|integer|min:1|max:5',
            'body' => 'required|string|min:10|max:2000',
        ]);

        // التحقق من وجود الطلب وأنه تم تسليمه (Delivered)
        $order = Order::where('order_number', trim($request->order_number))
            ->where('email', trim($request->email))
            ->where('status', 'delivered')
            ->first();

        if (!$order) {
            return back()->with('error', 'عذراً، كتابة التقييمات الموثقة متاحة فقط للطلبات المستلمة بالفعل.');
        }

        // التحقق من أن المنتج موجود في الطلب
        $hasProduct = $order->items()->where('product_id', (string) $request->product_id)->exists();
        if (!$hasProduct) {
            return back()->with('error', 'هذا المنتج لم يكن متواجداً في الطلب المحدد.');
        }

        ProductReview::updateOrCreate(
            ['order_id' => $order->id, 'product_id' => $request->product_id],
            [
                'customer_name' => $request->customer_name,
                'rating' => $request->rating,
                'body' => $request->body,
                'status' => 'pending', // يتطلب موافقة الإدارة قبل الظهور
            ]
        );

        return back()->with('success', 'شكراً لك! تم استلام تقييمك وسيظهر بعد المراجعة.');
    }
}
