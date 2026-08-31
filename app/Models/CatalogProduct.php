<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CatalogProduct extends Model {
    protected $fillable = [
        'slug',
        'name',
        'name_arabic',
        'description',
        'short_description',
        'price',
        'sale_price',
        'compare_at_price',
        'sku',
        'image_url',
        'category',
        'category_id',
        'featured',
        'manage_stock',
        'stock_status',
        'status',
    ];

    protected function casts(): array {
        return [
            'featured' => 'boolean',
            'manage_stock' => 'boolean',
            'price' => 'integer',
            'sale_price' => 'integer',
            'compare_at_price' => 'integer',
        ];
    }

    public function variants() {
        return $this->hasMany(ProductVariant::class, 'product_id');
    }

    public function media() {
        return $this->hasMany(ProductMedia::class, 'product_id')->orderBy('sort_order');
    }

    public function reviews() {
        return $this->hasMany(ProductReview::class, 'product_id');
    }

    public function approvedReviews() {
        return $this->hasMany(ProductReview::class, 'product_id')->where('status', 'approved');
    }

    public function categoryModel() {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function getEffectivePriceAttribute(): int {
        return $this->sale_price ?? $this->price;
    }

    public function getDiscountPercentageAttribute(): ?int {
        if ($this->compare_at_price && $this->compare_at_price > $this->effective_price) {
            return (int) round((($this->compare_at_price - $this->effective_price) / $this->compare_at_price) * 100);
        }
        return null;
    }

    public function scopePublished($query) {
        return $query->where('status', 'active');
    }
}
