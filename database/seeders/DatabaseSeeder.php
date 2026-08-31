<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder {
    public function run(): void {
        // إنشاء حساب المدير الافتراضي
        User::updateOrCreate(
            ['email' => 'admin@marj.store'],
            [
                'name' => 'مدير مرج',
                'password' => Hash::make('admin123456'),
                'role' => 'admin',
                'login_method' => 'local',
            ]
        );

        $this->call([
            StoreSettingsSeeder::class,
            ShippingZonesSeeder::class,
            PaymentMethodsSeeder::class,
            CatalogProductsSeeder::class,
        ]);
    }
}
