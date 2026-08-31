<?php

namespace App\Providers;

use App\Models\Cart;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider {
    public function register(): void {
        //
    }

    public function boot(): void {
        // مشاركة إعدادات المتجر والسلة مع جميع قوالب Blade
        View::composer('*', function ($view) {
            $sessionKey = session()->getId();
            $cart = null;

            if ($sessionKey) {
                $cart = Cart::where('session_key', $sessionKey)
                    ->with('items.variant.product')
                    ->first();
            }

            $view->with([
                'storeSettings' => StoreSetting::current(),
                'globalCart' => $cart,
                'cartItemsCount' => $cart?->items_count ?? 0,
            ]);
        });
    }
}
