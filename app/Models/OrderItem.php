<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model {
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'size',
        'quantity',
        'unit_price',
        'line_total',
    ];

    protected function casts(): array {
        return [
            'quantity' => 'integer',
            'unit_price' => 'integer',
            'line_total' => 'integer',
        ];
    }

    public function order() {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
