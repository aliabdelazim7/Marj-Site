<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model {
    protected $fillable = [
        'order_number',
        'user_id',
        'status',
        'customer_name',
        'email',
        'phone',
        'address',
        'city',
        'payment_method',
        'coupon_code',
        'coupon_discount',
        'shipment_carrier',
        'tracking_number',
        'tracking_url',
        'loyalty_awarded',
        'notes',
        'subtotal',
        'shipping',
        'total',
    ];

    protected function casts(): array {
        return [
            'subtotal' => 'integer',
            'shipping' => 'integer',
            'coupon_discount' => 'integer',
            'total' => 'integer',
            'loyalty_awarded' => 'boolean',
        ];
    }

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function items() {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function reviews() {
        return $this->hasMany(ProductReview::class, 'order_id');
    }

    public function getStatusArabicAttribute(): string {
        return match($this->status) {
            'pending' => 'قيد الانتظار',
            'confirmed' => 'تم التأكيد',
            'processing' => 'جاري التجهيز',
            'shipped' => 'تم الشحن',
            'delivered' => 'تم التسليم',
            'cancelled' => 'ملغي',
            default => $this->status,
        };
    }

    public function getStatusBadgeClassAttribute(): string {
        return match($this->status) {
            'pending' => 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            'confirmed' => 'bg-sky-500/10 text-sky-500 border-sky-500/20',
            'processing' => 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
            'shipped' => 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            'delivered' => 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'cancelled' => 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            default => 'bg-slate-500/10 text-slate-400',
        };
    }
}
