<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductMedia extends Model {
    protected $fillable = [
        'product_id',
        'url',
        'media_type',
        'alt_text',
        'sort_order',
    ];

    public function product() {
        return $this->belongsTo(CatalogProduct::class, 'product_id');
    }
}
