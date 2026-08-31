<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Services\CommerceService;
use Illuminate\Http\Request;

class CartController extends Controller {
    public function __construct(protected CommerceService $commerceService) {}

    public function index(Request $request) {
        $cart = $this->commerceService->getOrCreateCart($request->session()->getId(), auth()->id());
        return view('store.cart', compact('cart'));
    }

    public function add(Request $request) {
        $request->validate([
            'variant_id' => 'required|exists:product_variants,id',
            'quantity' => 'nullable|integer|min:1|max:50',
        ]);

        try {
            $cart = $this->commerceService->getOrCreateCart($request->session()->getId(), auth()->id());
            $this->commerceService->addToCart($cart, (int) $request->variant_id, (int) ($request->quantity ?? 1));

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'تمت إضافة المنتج إلى السلة بنجاح!',
                    'items_count' => $cart->refresh()->items_count,
                    'subtotal' => $cart->subtotal,
                ]);
            }

            return back()->with('success', 'تمت إضافة المنتج إلى السلة بنجاح!');
        } catch (\Exception $e) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
            }
            return back()->with('error', $e->getMessage());
        }
    }

    public function update(Request $request, int $itemId) {
        $request->validate([
            'quantity' => 'required|integer|min:0|max:50',
        ]);

        try {
            $this->commerceService->updateCartItem($itemId, (int) $request->quantity);

            $cart = $this->commerceService->getOrCreateCart($request->session()->getId(), auth()->id());

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'items_count' => $cart->items_count,
                    'subtotal' => $cart->subtotal,
                ]);
            }

            return back()->with('success', 'تم تحديث السلة.');
        } catch (\Exception $e) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
            }
            return back()->with('error', $e->getMessage());
        }
    }

    public function remove(Request $request, int $itemId) {
        $this->commerceService->removeCartItem($itemId);

        if ($request->wantsJson() || $request->ajax()) {
            $cart = $this->commerceService->getOrCreateCart($request->session()->getId(), auth()->id());
            return response()->json([
                'success' => true,
                'items_count' => $cart->items_count,
                'subtotal' => $cart->subtotal,
            ]);
        }

        return back()->with('success', 'تم حذف المنتج من السلة.');
    }
}
