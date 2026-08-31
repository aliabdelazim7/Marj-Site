<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CatalogProduct;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CommerceService {
    public function __construct(
        protected ShippingService $shippingService,
        protected CouponService $couponService,
        protected LoyaltyService $loyaltyService,
        protected WhatsAppService $whatsAppService
    ) {}

    public function getOrCreateCart(string $sessionKey, ?int $userId = null): Cart {
        $cart = Cart::firstOrCreate(
            ['session_key' => $sessionKey],
            ['user_id' => $userId]
        );

        if ($userId && !$cart->user_id) {
            $cart->update(['user_id' => $userId]);
        }

        return $cart->load('items.variant.product');
    }

    public function addToCart(Cart $cart, int $variantId, int $quantity = 1): CartItem {
        $variant = ProductVariant::with('product')->findOrFail($variantId);

        if ($variant->isOutOfStock()) {
            throw new \Exception("المقاس المحدد نفد من المخزون.");
        }

        $item = CartItem::firstOrNew([
            'cart_id' => $cart->id,
            'variant_id' => $variantId,
        ]);

        $newQty = ($item->exists ? $item->quantity : 0) + $quantity;

        if ($variant->product->manage_stock && $newQty > $variant->stock) {
            throw new \Exception("الكمية المطلوبة غير متوفرة حالياً في المخزون.");
        }

        $item->quantity = $newQty;
        $item->save();

        return $item;
    }

    public function updateCartItem(int $itemId, int $quantity): bool {
        $item = CartItem::with('variant.product')->findOrFail($itemId);

        if ($quantity <= 0) {
            return $item->delete();
        }

        if ($item->variant->product->manage_stock && $quantity > $item->variant->stock) {
            throw new \Exception("الكمية المطلوبة تتجاوز المخزون المتاح.");
        }

        $item->quantity = $quantity;
        return $item->save();
    }

    public function removeCartItem(int $itemId): bool {
        return CartItem::where('id', $itemId)->delete() > 0;
    }

    public function createOrder(array $data, Cart $cart, ?string $couponCode = null, int $redeemedPoints = 0): Order {
        if ($cart->items->isEmpty()) {
            throw new \Exception("سلة المشتريات فارغة.");
        }

        return DB::transaction(function () use ($data, $cart, $couponCode, $redeemedPoints) {
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($cart->items as $cartItem) {
                $variant = $cartItem->variant;
                $product = $variant->product;

                if ($product->manage_stock && $cartItem->quantity > $variant->stock) {
                    throw new \Exception("المخزون غير كافٍ للمنتج: {$product->nameArabic} (مقاس {$variant->size}).");
                }

                $unitPrice = $cartItem->unit_price;
                $lineTotal = $unitPrice * $cartItem->quantity;
                $subtotal += $lineTotal;

                $orderItemsData[] = [
                    'product_id' => (string) $product->id,
                    'product_name' => $product->nameArabic,
                    'size' => $variant->size,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $lineTotal,
                    'variant' => $variant,
                ];
            }

            // احتساب الخصم والكوبون
            $couponDiscount = 0;
            if ($couponCode) {
                $couponDiscount = $this->couponService->applyCoupon($couponCode, $subtotal);
            }

            // احتساب خصم نقاط الولاء
            $loyaltyDiscount = 0;
            if ($redeemedPoints > 0 && !empty($data['user_id'])) {
                $loyaltyDiscount = $this->loyaltyService->redeemPoints($data['user_id'], $redeemedPoints, $subtotal - $couponDiscount);
            }

            $totalDiscount = $couponDiscount + $loyaltyDiscount;

            // احتساب الشحن
            $shippingFee = $this->shippingService->calculateShipping($data['city'], $subtotal);

            // الإجمالي النهائي
            $finalTotal = max(0, $subtotal - $totalDiscount) + $shippingFee;

            // توليد رقم الطلب الفريد (مثال: MRJ-84920)
            $orderNumber = 'MRJ-' . strtoupper(Str::random(5));

            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $data['user_id'] ?? null,
                'status' => 'pending',
                'customer_name' => $data['customer_name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'address' => $data['address'],
                'city' => $data['city'],
                'payment_method' => $data['payment_method'] ?? 'cod',
                'coupon_code' => $couponCode,
                'coupon_discount' => $totalDiscount,
                'notes' => $data['notes'] ?? null,
                'subtotal' => $subtotal,
                'shipping' => $shippingFee,
                'total' => $finalTotal,
            ]);

            // إنشاء عناصر الطلب وخصم المخزون
            foreach ($orderItemsData as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'size' => $item['size'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'line_total' => $item['line_total'],
                ]);

                // خصم المخزون
                if ($item['variant']->product->manage_stock) {
                    $item['variant']->decrement('stock', $item['quantity']);
                    if ($item['variant']->stock <= 0) {
                        $item['variant']->update(['stock_status' => 'outofstock']);
                    }
                }
            }

            // تفريغ السلة
            $cart->items()->delete();

            return $order;
        });
    }
}
