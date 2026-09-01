<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

class PaymentMethodsSeeder extends Seeder {
    public function run(): void {
        $methods = [
            [
                'code' => 'cod',
                'label' => 'الدفع عند الاستلام (COD)',
                'type' => 'cod',
                'enabled' => true,
                'instructions' => 'يتم سداد إجمالي المبلغ نقدًا للمندوب عند استلام الشحنة وتجربتها.',
                'whatsapp_number' => null,
                'sort_order' => 1,
            ],
            [
                'code' => 'manual_transfer',
                'label' => 'تحويل محفظة إلكترونية / InstaPay',
                'type' => 'manual_transfer',
                'enabled' => false,
                'instructions' => 'قم بالتحويل على رقم المحفظة ثم أرسل صورة الإيصال عبر WhatsApp لتأكيد الطلب.',
                'whatsapp_number' => '01012345678',
                'sort_order' => 2,
            ],
            [
                'code' => 'online_card',
                'label' => 'بطاقة بنكية (فيزا / ماستركارد)',
                'type' => 'online_card',
                'enabled' => false,
                'instructions' => 'الدفع الإلكتروني المباشر عبر بطاقتك البنكية بأمان.',
                'whatsapp_number' => null,
                'sort_order' => 3,
            ],
        ];

        foreach ($methods as $method) {
            PaymentMethod::updateOrCreate(['code' => $method['code']], $method);
        }
    }
}
