<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingZone;
use App\Models\StoreSetting;
use Illuminate\Http\Request;

class AdminShippingController extends Controller {
    public function index() {
        $settings = StoreSetting::current();
        $zones = ShippingZone::orderBy('sort_order')->get();
        return view('admin.shipping.index', compact('settings', 'zones'));
    }

    public function updateSettings(Request $request) {
        $data = $request->validate([
            'shipping_fee' => 'required|integer|min:0',
            'free_shipping_threshold' => 'nullable|integer|min:1',
            'shipping_scope' => 'required|string|max:240',
            'shipping_notice' => 'required|string|max:5000',
        ]);

        $settings = StoreSetting::current();
        $settings->update($data);

        return back()->with('success', 'تم حفظ إعدادات الشحن العامة بنجاح!');
    }

    public function updateZone(Request $request, int $id) {
        $zone = ShippingZone::findOrFail($id);
        $data = $request->validate([
            'fee' => 'required|integer|min:0',
            'delivery_note' => 'nullable|string|max:240',
            'enabled' => 'boolean',
        ]);

        $zone->update($data);
        return back()->with('success', "تم تحديث سعر شحن محافظة {$zone->governorate} بنجاح!");
    }
}
