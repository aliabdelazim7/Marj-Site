<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentMethod;
use App\Models\ShippingZone;
use App\Services\CommerceService;
use App\Services\CouponService;
use App\Services\LoyaltyService;
use App\Services\ShippingService;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;

class CheckoutController extends Controller {
    public function __construct(
        protected CommerceService $commerceService,
        protected ShippingService $shippingService,
        protected CouponService $couponService,
        protected LoyaltyService $loyaltyService,
        protected WhatsAppService $whatsAppService
    ) {}

    public function index(Request $request) {
        $cart = $this->commerceService->getOrCreateCart($request->session()->getId(), auth()->id());

        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'سلة المشتريات فارغة.');
        }

        $shippingZones = $this->shippingService->getActiveZones();
        $paymentMethods = PaymentMethod::active()->get();
        $user = auth()->user();
        $loyaltyPoints = $user?->loyaltyAccount?->points ?? 0;

        return view('store.checkout', compact('cart', 'shippingZones', 'paymentMethods', 'loyaltyPoints'));
    }

    public function validateCoupon(Request $request) {
        $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|integer',
        ]);

        $result = $this->couponService->validateCoupon($request->code, (int) $request->subtotal);

        return response()->json($result);
    }

    public function process(Request $request) {
        $request->validate([
            'customer_name' => 'required|string|min:3|max:160',
            'email' => 'required|email|max:320',
            'phone' => 'required|string|min:10|max:20',
            'address' => 'required|string|min:5|max:500',
            'city' => 'required|string|max:80',
            'payment_method' => 'required|string|in:cod,manual_transfer,online_card',
            'coupon_code' => 'nullable|string|max:80',
            'redeem_points' => 'nullable|integer|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $cart = $this->commerceService->getOrCreateCart($request->session()->getId(), auth()->id());

            $order = $this->commerceService->createOrder(
                data: [
                    'customer_name' => $request->customer_name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'address' => $request->address,
                    'city' => $request->city,
                    'payment_method' => $request->payment_method,
                    'notes' => $request->notes,
                    'user_id' => auth()->id(),
                ],
                cart: $cart,
                couponCode: $request->coupon_code,
                redeemedPoints: (int) ($request->redeem_points ?? 0)
            );

            return redirect()->route('checkout.success', $order->order_number);
        } catch (\Exception $e) {
            return back()->withInput()->with('error', $e->getMessage());
        }
    }

    public function success(string $orderNumber) {
        $order = Order::with('items')->where('order_number', $orderNumber)->firstOrFail();
        $whatsAppUrl = $this->whatsAppService->generateOrderConfirmationUrl($order);

        $manualPaymentMethod = PaymentMethod::where('code', 'manual_transfer')->first();
        $manualPaymentWhatsAppUrl = null;

        if ($order->payment_method === 'manual_transfer' && $manualPaymentMethod?->whatsapp_number) {
            $manualPaymentWhatsAppUrl = $this->whatsAppService->generateManualPaymentReceiptUrl($order, $manualPaymentMethod->whatsapp_number);
        }

        return view('store.checkout-success', compact('order', 'whatsAppUrl', 'manualPaymentWhatsAppUrl', 'manualPaymentMethod'));
    }
}
