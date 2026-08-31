<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model {
    protected $fillable = [
        'cart_id',
        'variant_id',
        'quantity',
    ];

    protected function casts(): array {
        return [
            'quantity' => 'integer',
        ];
    }

    public function cart() {
        return $this->belongsTo(Cart::class, 'cart_id');
    }

    public function variant() {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    public function getUnitPriceAttribute(): int {
        return $this->variant?->price_override ?? $this->variant?->product?->effective_price ?? 0;
    }

    public function getLineTotalAttribute(): int {
        return $this->unit_price * $this->quantity;
    }
}
