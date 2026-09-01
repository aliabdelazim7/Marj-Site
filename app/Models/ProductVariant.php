<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model {
    protected $fillable = [
        'product_id',
        'sku',
        'size',
        'color',
        'stock',
        'safety_stock',
        'price_override',
        'stock_status',
        'status',
    ];

    protected function casts(): array {
        return [
            'stock' => 'integer',
            'safety_stock' => 'integer',
            'price_override' => 'integer',
        ];
    }

    public function product() {
        return $this->belongsTo(CatalogProduct::class, 'product_id');
    }

    public function isLowStock(): bool {
        return $this->stock > 0 && $this->stock <= $this->safety_stock;
    }

    public function isOutOfStock(): bool {
        return $this->stock <= 0 || $this->stock_status === 'outofstock';
    }
}
