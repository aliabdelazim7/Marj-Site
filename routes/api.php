<?php

use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\TryOnController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth');

Route::post('/cart/add', [CartController::class, 'add']);
Route::post('/checkout/validate-coupon', [CheckoutController::class, 'validateCoupon']);
Route::post('/try-on/generate', [TryOnController::class, 'generate']);
