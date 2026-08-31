<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductCategory extends Model {
    protected $fillable = [
        'slug',
        'name',
        'description',
        'status',
    ];

    public function products() {
        return $this->hasMany(CatalogProduct::class, 'category_id');
    }
}
