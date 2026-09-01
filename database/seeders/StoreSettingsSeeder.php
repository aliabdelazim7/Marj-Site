<?php

namespace Database\Seeders;

use App\Models\StoreSetting;
use Illuminate\Database\Seeder;

class StoreSettingsSeeder extends Seeder {
    public function run(): void {
        StoreSetting::updateOrCreate(
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
