<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\Request;

class AdminStoreSettingsController extends Controller {
    public function index() {
        $settings = StoreSetting::current();
        return view('admin.settings.index', compact('settings'));
    }

    public function update(Request $request) {
        $data = $request->validate([
            'brand_name' => 'required|string|max:120',
            'shipping_scope' => 'required|string|max:240',
            'shipping_notice' => 'required|string|max:5000',
            'return_policy' => 'required|string|max:5000',
            'payment_notice' => 'required|string|max:5000',
        ]);

        StoreSetting::current()->update($data);
        return back()->with('success', 'تم حفظ إعدادات المتجر بنجاح!');
    }
}
