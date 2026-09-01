<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LookbookEntry extends Model {
    protected $fillable = [
        'title',
        'title_arabic',
        'description',
        'image_url',
        'product_id',
        'sort_order',
        'published',
    ];

    protected function casts(): array {
        return [
            'sort_order' => 'integer',
            'published' => 'boolean',
        ];
    }

    public function product() {
        return $this->belongsTo(CatalogProduct::class, 'product_id');
    }
}
