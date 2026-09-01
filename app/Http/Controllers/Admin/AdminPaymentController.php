<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Models\StoreSetting;
use Illuminate\Http\Request;

class AdminPaymentController extends Controller {
    public function index() {
        $methods = PaymentMethod::orderBy('sort_order')->get();
        $settings = StoreSetting::current();
        return view('admin.payments.index', compact('methods', 'settings'));
    }

    public function update(Request $request, int $id) {
        $method = PaymentMethod::findOrFail($id);
        $data = $request->validate([
            'label' => 'required|string|max:120',
            'enabled' => 'boolean',
            'instructions' => 'nullable|string|max:5000',
            'whatsapp_number' => 'nullable|string|max:16',
        ]);

        $method->update($data);
        return back()->with('success', "تم تحديث إعدادات طريقة الدفع: {$method->label} بنجاح!");
    }

    public function updateNotice(Request $request) {
        $data = $request->validate([
            'payment_notice' => 'required|string|max:5000',
            'return_policy' => 'required|string|max:5000',
        ]);

        StoreSetting::current()->update($data);
        return back()->with('success', 'تم حفظ سياسات الدفع والاسترجاع بنجاح!');
    }
}
