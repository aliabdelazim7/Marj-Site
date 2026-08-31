<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommerceEvent extends Model {
    protected $fillable = [
        'session_key',
        'user_id',
        'event_name',
        'product_id',
        'order_id',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function product() {
        return $this->belongsTo(CatalogProduct::class, 'product_id');
    }

    public function order() {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
