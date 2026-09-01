<?php

use App\Http\Controllers\Admin\AdminAnalyticsController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminCouponController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminLookbookController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminPaymentController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminReviewController;
use App\Http\Controllers\Admin\AdminShippingController;
use App\Http\Controllers\Admin\AdminStoreSettingsController;
use App\Http\Controllers\Admin\AdminTeamController;
use App\Http\Controllers\Store\AuthController;
use App\Http\Controllers\Store\CartController;
use App\Http\Controllers\Store\CheckoutController;
use App\Http\Controllers\Store\HomeController;
use App\Http\Controllers\Store\LookbookController;
use App\Http\Controllers\Store\OrderTrackingController;
use App\Http\Controllers\Store\ProductController;
use App\Http\Controllers\Store\ReviewController;
use App\Http\Controllers\Store\TryOnController;
use App\Http\Controllers\Store\UserAccountController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront Web Routes (متجر مرج)
|--------------------------------------------------------------------------
*/

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/policies', [HomeController::class, 'policies'])->name('policies');

// المنتجات
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('products.show');

// السلة
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::post('/cart/update/{id}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/remove/{id}', [CartController::class, 'remove'])->name('cart.remove');

// إتمام الطلب (Checkout)
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout/validate-coupon', [CheckoutController::class, 'validateCoupon'])->name('checkout.validate-coupon');
Route::post('/checkout/process', [CheckoutController::class, 'process'])->name('checkout.process');
Route::get('/order/confirmed/{orderNumber}', [CheckoutController::class, 'success'])->name('checkout.success');

// تتبع الطلب واللوك بوك
Route::get('/track-order', [OrderTrackingController::class, 'index'])->name('track-order');
Route::get('/lookbook', [LookbookController::class, 'index'])->name('lookbook');

// تجربة اللبس الافتراضية
Route::post('/try-on/generate', [TryOnController::class, 'generate'])->name('try-on.generate');

// الأوتو ديبلوي (Auto Deploy Webhook)
Route::match(['get', 'post'], '/deploy-webhook', [\App\Http\Controllers\DeployWebhookController::class, 'deploy'])->name('deploy.webhook');

// تقييمات المشترين الموثقين
Route::post('/reviews/store', [ReviewController::class, 'store'])->name('reviews.store');

// قبول دعوة الفريق
Route::get('/team/accept/{token}', function ($token) {
    return redirect()->route('login')->with('info', 'يرجى تسجيل الدخول أو إنشاء حساب جديد لتفعيل صلاحية الفريق.');
})->name('team.accept-invite');

// المصادقة والحساب
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/account', [UserAccountController::class, 'index'])->name('account.index');
    Route::get('/wishlist', [UserAccountController::class, 'wishlist'])->name('account.wishlist');
    Route::post('/wishlist/toggle/{productId}', [UserAccountController::class, 'toggleWishlist'])->name('account.wishlist.toggle');
});

/*
|--------------------------------------------------------------------------
| Admin Dashboard Routes (لوحة تحكم مرج)
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
    // نظرة عامة
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    // المنتجات والـ Variants والوسائط
    Route::get('/products', [AdminProductController::class, 'index'])->name('products.index');
    Route::get('/products/create', [AdminProductController::class, 'create'])->name('products.create');
    Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
    Route::get('/products/{id}/edit', [AdminProductController::class, 'edit'])->name('products.edit');
    Route::put('/products/{id}', [AdminProductController::class, 'update'])->name('products.update');
    Route::put('/variants/{variantId}', [AdminProductController::class, 'updateVariant'])->name('variants.update');
    Route::post('/products/{id}/media', [AdminProductController::class, 'addMedia'])->name('products.media.add');
    Route::delete('/media/{mediaId}', [AdminProductController::class, 'deleteMedia'])->name('products.media.delete');

    // التصنيفات
    Route::get('/categories', [AdminCategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [AdminCategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{id}', [AdminCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy'])->name('categories.destroy');

    // الطلبات والتتبع
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{id}', [AdminOrderController::class, 'show'])->name('orders.show');
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::put('/orders/{id}/fulfillment', [AdminOrderController::class, 'updateFulfillment'])->name('orders.update-fulfillment');

    // الكوبونات
    Route::get('/coupons', [AdminCouponController::class, 'index'])->name('coupons.index');
    Route::post('/coupons', [AdminCouponController::class, 'store'])->name('coupons.store');
    Route::put('/coupons/{id}', [AdminCouponController::class, 'update'])->name('coupons.update');
    Route::delete('/coupons/{id}', [AdminCouponController::class, 'destroy'])->name('coupons.destroy');

    // المراجعات
    Route::get('/reviews', [AdminReviewController::class, 'index'])->name('reviews.index');
    Route::put('/reviews/{id}/status', [AdminReviewController::class, 'updateStatus'])->name('reviews.update-status');
    Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy'])->name('reviews.destroy');

    // الشحن
    Route::get('/shipping', [AdminShippingController::class, 'index'])->name('shipping.index');
    Route::put('/shipping/settings', [AdminShippingController::class, 'updateSettings'])->name('shipping.settings.update');
    Route::put('/shipping/zones/{id}', [AdminShippingController::class, 'updateZone'])->name('shipping.zones.update');

    // بوابات الدفع
    Route::get('/payments', [AdminPaymentController::class, 'index'])->name('payments.index');
    Route::put('/payments/methods/{id}', [AdminPaymentController::class, 'update'])->name('payments.methods.update');
    Route::put('/payments/notices', [AdminPaymentController::class, 'updateNotice'])->name('payments.notices.update');

    // التحليلات
    Route::get('/analytics', [AdminAnalyticsController::class, 'index'])->name('analytics.index');

    // اللوك بوك
    Route::get('/lookbook', [AdminLookbookController::class, 'index'])->name('lookbook.index');
    Route::post('/lookbook', [AdminLookbookController::class, 'store'])->name('lookbook.store');
    Route::put('/lookbook/{id}', [AdminLookbookController::class, 'update'])->name('lookbook.update');
    Route::delete('/lookbook/{id}', [AdminLookbookController::class, 'destroy'])->name('lookbook.destroy');

    // إعدادات المتجر العامة
    Route::get('/settings', [AdminStoreSettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings', [AdminStoreSettingsController::class, 'update'])->name('settings.update');

    // فريق العمل
    Route::get('/team', [AdminTeamController::class, 'index'])->name('team.index');
    Route::post('/team/invites', [AdminTeamController::class, 'createInvite'])->name('team.invites.create');
    Route::delete('/team/invites/{id}', [AdminTeamController::class, 'revokeInvite'])->name('team.invites.revoke');
    Route::delete('/team/members/{id}', [AdminTeamController::class, 'revokeMember'])->name('team.members.revoke');
});
