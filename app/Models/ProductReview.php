<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model {
    protected $fillable = [
        'order_id',
        'product_id',
        'customer_name',
        'rating',
        'body',
        'status',
    ];

    protected function casts(): array {
        return [
            'rating' => 'integer',
        ];
    }

    public function order() {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function product() {
        return $this->belongsTo(CatalogProduct::class, 'product_id');
    }
}
