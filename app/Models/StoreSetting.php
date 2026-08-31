<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model {
    protected $fillable = [
        'brand_name',
        'shipping_scope',
        'shipping_fee',
        'free_shipping_threshold',
        'shipping_notice',
        'return_policy',
        'payment_notice',
    ];

    protected function casts(): array {
        return [
            'shipping_fee' => 'integer',
            'free_shipping_threshold' => 'integer',
        ];
    }

    public static function current(): self {
        return static::firstOrCreate(
            ['id' => 1],
            [
                'brand_name' => 'مرج',
                'shipping_scope' => 'الشحن متاح لجميع محافظات مصر',
                'shipping_fee' => 50,
                'free_shipping_threshold' => 2000,
                'shipping_notice' => 'الشحن يتم عبر شركات شحن معتمدة خلال 2-4 أيام عمل.',
                'return_policy' => 'استبدال واسترجاع مجاني خلال 14 يومًا من تاريخ الاستلام بشرط سلامة المنتج.',
                'payment_notice' => 'الدفع متاح عند الاستلام أو عبر المحافظ الإلكترونية وInstaPay.',
            ]
        );
    }
}
