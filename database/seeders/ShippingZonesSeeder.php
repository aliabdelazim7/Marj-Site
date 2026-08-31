<?php

namespace Database\Seeders;

use App\Models\ShippingZone;
use Illuminate\Database\Seeder;

class ShippingZonesSeeder extends Seeder {
    public function run(): void {
        $zones = [
            ['governorate' => 'القاهرة', 'fee' => 45, 'delivery_note' => 'توصيل خلال 24-48 ساعة', 'enabled' => true, 'sort_order' => 1],
            ['governorate' => 'الجيزة', 'fee' => 45, 'delivery_note' => 'توصيل خلال 24-48 ساعة', 'enabled' => true, 'sort_order' => 2],
            ['governorate' => 'الإسكندرية', 'fee' => 55, 'delivery_note' => 'توصيل خلال 48 ساعة', 'enabled' => true, 'sort_order' => 3],
            ['governorate' => 'القليوبية', 'fee' => 50, 'delivery_note' => 'توصيل خلال 2-3 أيام', 'enabled' => true, 'sort_order' => 4],
            ['governorate' => 'الشرقية', 'fee' => 55, 'delivery_note' => 'توصيل خلال 2-3 أيام', 'enabled' => true, 'sort_order' => 5],
            ['governorate' => 'الدقهلية', 'fee' => 55, 'delivery_note' => 'توصيل خلال 2-3 أيام', 'enabled' => true, 'sort_order' => 6],
            ['governorate' => 'الغربية', 'fee' => 55, 'delivery_note' => 'توصيل خلال 2-3 أيام', 'enabled' => true, 'sort_order' => 7],
            ['governorate' => 'المنوفية', 'fee' => 55, 'delivery_note' => 'توصيل خلال 2-3 أيام', 'enabled' => true, 'sort_order' => 8],
            ['governorate' => 'البحيرة', 'fee' => 55, 'delivery_note' => 'توصيل خلال 2-3 أيام', 'enabled' => true, 'sort_order' => 9],
            ['governorate' => 'كفر الشيخ', 'fee' => 60, 'delivery_note' => 'توصيل خلال 2-3 أيام', 'enabled' => true, 'sort_order' => 10],
            ['governorate' => 'دمياط', 'fee' => 60, 'delivery_note' => 'توصيل خلال 2-3 أيام', 'enabled' => true, 'sort_order' => 11],
            ['governorate' => 'بورسعيد', 'fee' => 60, 'delivery_note' => 'توصيل خلال 2-3 أيام', 'enabled' => true, 'sort_order' => 12],
            ['governorate' => 'الإسماعيلية', 'fee' => 60, 'delivery_note' => 'توصيل خلال 2-3 أيام', 'enabled' => true, 'sort_order' => 13],
            ['governorate' => 'السويس', 'fee' => 60, 'delivery_note' => 'توصيل خلال 2-3 أيام', 'enabled' => true, 'sort_order' => 14],
            ['governorate' => 'الفيوم', 'fee' => 65, 'delivery_note' => 'توصيل خلال 3-4 أيام', 'enabled' => true, 'sort_order' => 15],
            ['governorate' => 'بني سويف', 'fee' => 65, 'delivery_note' => 'توصيل خلال 3-4 أيام', 'enabled' => true, 'sort_order' => 16],
            ['governorate' => 'المنيا', 'fee' => 70, 'delivery_note' => 'توصيل خلال 3-4 أيام', 'enabled' => true, 'sort_order' => 17],
            ['governorate' => 'أسيوط', 'fee' => 75, 'delivery_note' => 'توصيل خلال 3-4 أيام', 'enabled' => true, 'sort_order' => 18],
            ['governorate' => 'سوهاج', 'fee' => 75, 'delivery_note' => 'توصيل خلال 3-4 أيام', 'enabled' => true, 'sort_order' => 19],
            ['governorate' => 'قنا', 'fee' => 80, 'delivery_note' => 'توصيل خلال 3-5 أيام', 'enabled' => true, 'sort_order' => 20],
            ['governorate' => 'الأقصر', 'fee' => 85, 'delivery_note' => 'توصيل خلال 3-5 أيام', 'enabled' => true, 'sort_order' => 21],
            ['governorate' => 'أسوان', 'fee' => 85, 'delivery_note' => 'توصيل خلال 3-5 أيام', 'enabled' => true, 'sort_order' => 22],
            ['governorate' => 'البحر الأحمر', 'fee' => 85, 'delivery_note' => 'توصيل خلال 3-5 أيام', 'enabled' => true, 'sort_order' => 23],
            ['governorate' => 'مطروح', 'fee' => 85, 'delivery_note' => 'توصيل خلال 3-5 أيام', 'enabled' => true, 'sort_order' => 24],
            ['governorate' => 'شمال سيناء', 'fee' => 90, 'delivery_note' => 'توصيل خلال 4-6 أيام', 'enabled' => true, 'sort_order' => 25],
            ['governorate' => 'جنوب سيناء', 'fee' => 90, 'delivery_note' => 'توصيل خلال 4-6 أيام', 'enabled' => true, 'sort_order' => 26],
            ['governorate' => 'الوادي الجديد', 'fee' => 95, 'delivery_note' => 'توصيل خلال 4-6 أيام', 'enabled' => true, 'sort_order' => 27],
        ];

        foreach ($zones as $zone) {
            ShippingZone::updateOrCreate(['governorate' => $zone['governorate']], $zone);
        }
    }
}
