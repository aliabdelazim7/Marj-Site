<?php

namespace App\Providers;

use App\Models\Cart;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider {
    public function register(): void {
        //
    }

    public function boot(): void {
        // مشاركة إعدادات المتجر والسلة مع جميع قوالب Blade
        View::composer('*', function ($view) {
            $storeSettings = null;
            $cart = null;
            $cartCount = 0;

            try {
                if (Schema::hasTable('store_settings')) {
                    $storeSettings = StoreSetting::current();
                }
                $sessionKey = session()->getId();
                if ($sessionKey && Schema::hasTable('carts')) {
                    $cart = Cart::where('session_key', $sessionKey)
                        ->with('items.variant.product')
                        ->first();
                    $cartCount = $cart?->items_count ?? 0;
                }
            } catch (\Throwable) {
                // Ignore if DB not ready during early bootstrap/tests
            }

            $view->with([
                'storeSettings' => $storeSettings ?? new StoreSetting([
                    'brand_name' => 'مرج',
                    'shipping_fee' => 50,
                    'free_shipping_threshold' => 2000,
                ]),
                'cart' => $cart,
                'globalCart' => $cart,
                'cartItemsCount' => $cartCount,
            ]);
        });
    }
}
