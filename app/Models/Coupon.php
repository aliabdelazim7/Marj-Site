<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model {
    protected $fillable = [
        'code',
        'type',
        'value',
        'minimum_subtotal',
        'usage_limit',
        'used_count',
        'starts_at',
        'expires_at',
        'enabled',
    ];

    protected function casts(): array {
        return [
            'value' => 'integer',
            'minimum_subtotal' => 'integer',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
            'enabled' => 'boolean',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function isValidForSubtotal(int $subtotal): bool {
        if (!$this->enabled) return false;
        if (now()->lt($this->starts_at)) return false;
        if ($this->expires_at && now()->gt($this->expires_at)) return false;
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) return false;
        if ($subtotal < $this->minimum_subtotal) return false;
        return true;
    }

    public function calculateDiscount(int $subtotal): int {
        if (!$this->isValidForSubtotal($subtotal)) return 0;
        if ($this->type === 'percentage') {
            return (int) min($subtotal, round(($subtotal * $this->value) / 100));
        }
        return (int) min($subtotal, $this->value);
    }
}
