<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingZone extends Model {
    protected $fillable = [
        'governorate',
        'fee',
        'delivery_note',
        'enabled',
        'sort_order',
    ];

    protected function casts(): array {
        return [
            'fee' => 'integer',
            'enabled' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function scopeActive($query) {
        return $query->where('enabled', true)->orderBy('sort_order');
    }
}
