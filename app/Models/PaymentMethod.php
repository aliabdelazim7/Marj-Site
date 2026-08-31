<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model {
    protected $fillable = [
        'code',
        'label',
        'type',
        'enabled',
        'instructions',
        'whatsapp_number',
        'sort_order',
    ];

    protected function casts(): array {
        return [
            'enabled' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function scopeActive($query) {
        return $query->where('enabled', true)->orderBy('sort_order');
    }
}
