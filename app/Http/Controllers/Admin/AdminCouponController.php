<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class AdminCouponController extends Controller {
    public function index() {
        $coupons = Coupon::latest()->get();
        return view('admin.coupons.index', compact('coupons'));
    }

    public function store(Request $request) {
        $data = $request->validate([
            'code' => 'required|string|max:80|unique:coupons,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|integer|min:1',
            'minimum_subtotal' => 'required|integer|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'starts_at' => 'required|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'enabled' => 'boolean',
        ]);

        Coupon::create($data);
        return back()->with('success', 'تم إنشاء الكوبون بنجاح!');
    }

    public function update(Request $request, int $id) {
        $coupon = Coupon::findOrFail($id);
        $data = $request->validate([
            'code' => "required|string|max:80|unique:coupons,code,{$id}",
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|integer|min:1',
            'minimum_subtotal' => 'required|integer|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'starts_at' => 'required|date',
            'expires_at' => 'nullable|date|after:starts_at',
            'enabled' => 'boolean',
        ]);

        $coupon->update($data);
        return back()->with('success', 'تم تحديث الكوبون بنجاح!');
    }

    public function destroy(int $id) {
        Coupon::findOrFail($id)->delete();
        return back()->with('success', 'تم حذف الكوبون.');
    }
}
