<?php

namespace Database\Seeders;

use App\Models\CatalogProduct;
use App\Models\ProductCategory;
use App\Models\ProductMedia;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class CatalogProductsSeeder extends Seeder {
    public function run(): void {
        $category = ProductCategory::updateOrCreate(
            ['slug' => 'hoodies'],
            [
                'name' => 'هوديز',
                'description' => 'المجموعة الأساسية من هوديز مرج المصنوعة من القطن المصري الثقيل 100%',
                'status' => 'active',
            ]
        );

        $products = [
            [
                'slug' => 'onyx-black-hoodie',
                'name' => 'Onyx Black',
                'name_arabic' => 'أسود فحم',
                'description' => 'هودي أسود كلاسيكي أوفرسايز من قطن مصري 100% ثقيل 420gsm، ملمس ناعم من الداخل وقصة مريحة تحافظ على رونقها.',
                'short_description' => 'أسود فحم بقماش قطن مصري ثقيل وقصة أوفرسايز مريحة.',
                'price' => 899,
                'compare_at_price' => 1150,
                'sku' => 'MRJ-BLK-001',
                'image_url' => '/products/onyx-black.png',
                'category' => 'هوديز',
                'category_id' => $category->id,
                'featured' => true,
                'manage_stock' => true,
                'stock_status' => 'instock',
                'status' => 'active',
                'variants' => [
                    ['size' => 'S', 'color' => 'أسود فحم', 'stock' => 15],
                    ['size' => 'M', 'color' => 'أسود فحم', 'stock' => 25],
                    ['size' => 'L', 'color' => 'أسود فحم', 'stock' => 30],
                    ['size' => 'XL', 'color' => 'أسود فحم', 'stock' => 15],
                ],
            ],
            [
                'slug' => 'mocha-earth-hoodie',
                'name' => 'Mocha Earth',
                'name_arabic' => 'بني موكا',
                'description' => 'درجة بني ترابي دافئة بقصة أوفرسايز عصرية وخامة قطنية ثقيلة ومريحة للاستخدام اليومي المتكرر.',
                'short_description' => 'بني موكا دافئ بقماش قطني كثيف ومظهر فاخر.',
                'price' => 949,
                'compare_at_price' => 1200,
                'sku' => 'MRJ-MCH-001',
                'image_url' => '/products/mocha-earth.png',
                'category' => 'هوديز',
                'category_id' => $category->id,
                'featured' => true,
                'manage_stock' => true,
                'stock_status' => 'instock',
                'status' => 'active',
                'variants' => [
                    ['size' => 'S', 'color' => 'بني موكا', 'stock' => 12],
                    ['size' => 'M', 'color' => 'بني موكا', 'stock' => 20],
                    ['size' => 'L', 'color' => 'بني موكا', 'stock' => 25],
                    ['size' => 'XL', 'color' => 'بني موكا', 'stock' => 10],
                ],
            ],
            [
                'slug' => 'paper-white-hoodie',
                'name' => 'Paper White',
                'name_arabic' => 'أبيض ورقي',
                'description' => 'هودي أبيض ناصع بتصميم استوديو أنيق من قطن مصري معالج، أساسي لكل إطلالاتك اليومية.',
                'short_description' => 'نسخة هادئة من الأساسيات بلون أبيض ورقي ناصع.',
                'price' => 849,
                'compare_at_price' => 1050,
                'sku' => 'MRJ-WHT-001',
                'image_url' => '/products/paper-white.png',
                'category' => 'هوديز',
                'category_id' => $category->id,
                'featured' => true,
                'manage_stock' => true,
                'stock_status' => 'instock',
                'status' => 'active',
                'variants' => [
                    ['size' => 'S', 'color' => 'أبيض ناصع', 'stock' => 10],
                    ['size' => 'M', 'color' => 'أبيض ناصع', 'stock' => 18],
                    ['size' => 'L', 'color' => 'أبيض ناصع', 'stock' => 22],
                    ['size' => 'XL', 'color' => 'أبيض ناصع', 'stock' => 12],
                ],
            ],
            [
                'slug' => 'coastal-wave-hoodie',
                'name' => 'Coastal Wave',
                'name_arabic' => 'أزرق ساحلي',
                'description' => 'لون أزرق هادئ مستوحى من أمواج البحر المتوسط، مبطن وممشط بعناية فائقة لراحة تدوم طويلاً.',
                'short_description' => 'أزرق ساحلي كلاسيكي بتفاصيل مريحة.',
                'price' => 899,
                'compare_at_price' => 1150,
                'sku' => 'MRJ-BLU-001',
                'image_url' => '/products/coastal-wave.png',
                'category' => 'هوديز',
                'category_id' => $category->id,
                'featured' => true,
                'manage_stock' => true,
                'stock_status' => 'instock',
                'status' => 'active',
                'variants' => [
                    ['size' => 'S', 'color' => 'أزرق ساحلي', 'stock' => 14],
                    ['size' => 'M', 'color' => 'أزرق ساحلي', 'stock' => 20],
                    ['size' => 'L', 'color' => 'أزرق ساحلي', 'stock' => 24],
                    ['size' => 'XL', 'color' => 'أزرق ساحلي', 'stock' => 10],
                ],
            ],
            [
                'slug' => 'burgundy-crimson-hoodie',
                'name' => 'Burgundy Crimson',
                'name_arabic' => 'عنابي كرزي',
                'description' => 'هودي بلون عنابي كرزي غني، يعطي حضوراً متميزاً وأناقة لافتة مع الدفء الكامل.',
                'short_description' => 'عنابي كرزي أنيق بقماش قطن مصري ممتاز.',
                'price' => 879,
                'compare_at_price' => 1100,
                'sku' => 'MRJ-RED-001',
                'image_url' => '/products/burgundy-crimson.png',
                'category' => 'هوديز',
                'category_id' => $category->id,
                'featured' => true,
                'manage_stock' => true,
                'stock_status' => 'instock',
                'status' => 'active',
                'variants' => [
                    ['size' => 'S', 'color' => 'عنابي كرزي', 'stock' => 12],
                    ['size' => 'M', 'color' => 'عنابي كرزي', 'stock' => 18],
                    ['size' => 'L', 'color' => 'عنابي كرزي', 'stock' => 20],
                    ['size' => 'XL', 'color' => 'عنابي كرزي', 'stock' => 10],
                ],
            ],
        ];

        // Delete all old products not in this list
        $validSlugs = array_column($products, 'slug');
        CatalogProduct::whereNotIn('slug', $validSlugs)->delete();

        foreach ($products as $item) {
            $variants = $item['variants'];
            unset($item['variants']);

            $product = CatalogProduct::updateOrCreate(['slug' => $item['slug']], $item);

            foreach ($variants as $v) {
                ProductVariant::updateOrCreate(
                    ['product_id' => $product->id, 'size' => $v['size']],
                    [
                        'sku' => "{$product->sku}-{$v['size']}",
                        'color' => $v['color'],
                        'stock' => $v['stock'],
                        'safety_stock' => 3,
                        'stock_status' => 'instock',
                        'status' => 'active',
                    ]
                );
            }

            // Media setup (Front and 3D)
            ProductMedia::updateOrCreate(
                ['product_id' => $product->id, 'media_type' => 'front'],
                ['url' => $item['image_url'], 'alt_text' => "الواجهة الأمامية لهودي {$product->name_arabic}", 'sort_order' => 1]
            );

            ProductMedia::updateOrCreate(
                ['product_id' => $product->id, 'media_type' => 'model3d'],
                ['url' => '/models/hoodie.glb', 'alt_text' => "مجسم 3D لهودي {$product->name_arabic}", 'sort_order' => 2]
            );
        }
    }
}
