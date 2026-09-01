<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountWishlist extends Model {
    protected $fillable = [
        'user_id',
        'product_id',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function product() {
        return $this->belongsTo(CatalogProduct::class, 'product_id');
    }
}
