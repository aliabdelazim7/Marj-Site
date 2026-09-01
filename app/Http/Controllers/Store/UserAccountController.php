<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\AccountWishlist;
use App\Models\CatalogProduct;
use Illuminate\Http\Request;

class UserAccountController extends Controller {
    public function index() {
        $user = auth()->user()->load(['orders.items', 'loyaltyAccount', 'loyaltyLedgers' => function ($q) {
            $q->latest()->take(20);
        }]);

        return view('store.account.index', compact('user'));
    }

    public function wishlist() {
        $wishlists = AccountWishlist::where('user_id', auth()->id())
            ->with('product.variants')
            ->latest()
            ->get();

        return view('store.account.wishlist', compact('wishlists'));
    }

    public function toggleWishlist(Request $request, int $productId) {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'يرجى تسجيل الدخول أولاً.'], 401);
        }

        $existing = AccountWishlist::where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();

        if ($existing) {
            $existing->delete();
            $added = false;
        } else {
            AccountWishlist::create(['user_id' => $user->id, 'product_id' => $productId]);
            $added = true;
        }

        return response()->json([
            'success' => true,
            'added' => $added,
            'message' => $added ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة',
        ]);
    }
}
