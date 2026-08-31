<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model {
    protected $fillable = [
        'session_key',
        'user_id',
    ];

    public function items() {
        return $this->hasMany(CartItem::class, 'cart_id')->with('variant.product');
    }

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getSubtotalAttribute(): int {
        return $this->items->sum(function ($item) {
            $price = $item->variant?->price_override ?? $item->variant?->product?->effective_price ?? 0;
            return $price * $item->quantity;
        });
    }

    public function getItemsCountAttribute(): int {
        return $this->items->sum('quantity');
    }
}
