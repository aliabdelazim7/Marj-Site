<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryAdjustment extends Model {
    protected $fillable = [
        'variant_id',
        'delta',
        'resulting_stock',
        'reason',
        'created_by_user_id',
    ];

    protected function casts(): array {
        return [
            'delta' => 'integer',
            'resulting_stock' => 'integer',
        ];
    }

    public function variant() {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
