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
                'slug' => 'night-grid-hoodie',
                'name' => 'Night Grid',
                'name_arabic' => 'شبكة ليلية',
                'description' => 'أسود عميق مع قماش قطني 420gsm وتفاصيل حياكة متينة. هودي كلاسيكي بقصة Oversized مريحة وتلبيس نظيف.',
                'short_description' => 'أسود عميق بقماش قطن مصري ثقيل وتفاصيل هادئة.',
                'price' => 949,
                'compare_at_price' => 1200,
                'sku' => 'MRJ-NG-001',
                'image_url' => '/manus-storage/night-grid-front_c4bb4ea5.jpg',
                'side_url' => '/manus-storage/night-grid-side_02e9d7ec.jpg',
                'category' => 'هوديز',
                'category_id' => $category->id,
                'featured' => true,
                'manage_stock' => true,
                'stock_status' => 'instock',
                'status' => 'active',
                'variants' => [
                    ['size' => 'S', 'color' => 'أسود ليلي', 'stock' => 12],
                    ['size' => 'M', 'color' => 'أسود ليلي', 'stock' => 18],
                    ['size' => 'L', 'color' => 'أسود ليلي', 'stock' => 25],
                    ['size' => 'XL', 'color' => 'أسود ليلي', 'stock' => 10],
                ],
            ],
            [
                'slug' => 'signal-red-hoodie',
                'name' => 'Signal Red',
                'name_arabic' => 'إشارة حمراء',
                'description' => 'هودي أحمر قطني ثقيل بقصة نظيفة وتفاصيل حادة. صممنا إشارة حمراء من قطن ممشط بملمس ناعم من الداخل وقصة تحافظ على شكلها.',
                'short_description' => 'هودي أحمر قطني ثقيل بقصة نظيفة وتفاصيل واضحة.',
                'price' => 899,
                'compare_at_price' => 1100,
                'sku' => 'MRJ-SR-001',
                'image_url' => '/manus-storage/signal-red-front_ea8ae7ae.jpg',
                'side_url' => '/manus-storage/signal-red-side_1a2ce874.jpg',
                'category' => 'هوديز',
                'category_id' => $category->id,
                'featured' => true,
                'manage_stock' => true,
                'stock_status' => 'instock',
                'status' => 'active',
                'variants' => [
                    ['size' => 'S', 'color' => 'أحمر إشارة', 'stock' => 15],
                    ['size' => 'M', 'color' => 'أحمر إشارة', 'stock' => 20],
                    ['size' => 'L', 'color' => 'أحمر إشارة', 'stock' => 25],
                    ['size' => 'XL', 'color' => 'أحمر إشارة', 'stock' => 15],
                ],
            ],
            [
                'slug' => 'paper-white-hoodie',
                'name' => 'Paper White',
                'name_arabic' => 'أبيض ورقي',
                'description' => 'درجة أوف وايت دافئة وقماش قطني كثيف 420gsm يجعلان القطعة أساساً نظيفاً لكل طبقاتك اليومية.',
                'short_description' => 'نسخة هادئة من الأساسيات بلون أبيض ورقي دافئ.',
                'price' => 849,
                'compare_at_price' => 1050,
                'sku' => 'MRJ-PW-001',
                'image_url' => '/manus-storage/paper-white-front_c5e44344.jpg',
                'side_url' => '/manus-storage/paper-white-side_6428f880.jpg',
                'category' => 'هوديز',
                'category_id' => $category->id,
                'featured' => true,
                'manage_stock' => true,
                'stock_status' => 'instock',
                'status' => 'active',
                'variants' => [
                    ['size' => 'S', 'color' => 'أبيض ناصع', 'stock' => 12],
                    ['size' => 'M', 'color' => 'أبيض ناصع', 'stock' => 18],
                    ['size' => 'L', 'color' => 'أبيض ناصع', 'stock' => 22],
                    ['size' => 'XL', 'color' => 'أبيض ناصع', 'stock' => 14],
                ],
            ],
            [
                'slug' => 'concrete-grey-hoodie',
                'name' => 'Concrete Grey',
                'name_arabic' => 'رمادي خرسانة',
                'description' => 'رمادي محايد بقصة واسعة ومدروسة. توازن عملي بين المظهر العصري وراحة الاستخدام اليومي المتكرر.',
                'short_description' => 'توازن عملي بين الملمس الصناعي والراحة اليومية.',
                'price' => 879,
                'compare_at_price' => 1100,
                'sku' => 'MRJ-CG-001',
                'image_url' => '/manus-storage/concrete-grey-front_a010e741.jpg',
                'side_url' => '/manus-storage/concrete-grey-side_d55f77ef.jpg',
                'category' => 'هوديز',
                'category_id' => $category->id,
                'featured' => true,
                'manage_stock' => true,
                'stock_status' => 'instock',
                'status' => 'active',
                'variants' => [
                    ['size' => 'S', 'color' => 'رمادي خرسانة', 'stock' => 14],
                    ['size' => 'M', 'color' => 'رمادي خرسانة', 'stock' => 20],
                    ['size' => 'L', 'color' => 'رمادي خرسانة', 'stock' => 25],
                    ['size' => 'XL', 'color' => 'رمادي خرسانة', 'stock' => 12],
                ],
            ],
            [
                'slug' => 'forest-sage-hoodie',
                'name' => 'Forest Sage',
                'name_arabic' => 'أخضر غابي',
                'description' => 'درجة خضراء ترابية مستوحاة من الطبيعة الساحلية مع قماش قطني معالج ومبطن.',
                'short_description' => 'لون زيتي ترابي هادئ بقماش قطن مصري ممتاز.',
                'price' => 899,
                'compare_at_price' => 1150,
                'sku' => 'MRJ-FS-001',
                'image_url' => '/products/forest-sage-front.jpg',
                'side_url' => '/products/forest-sage-back.jpg',
                'category' => 'هوديز',
                'category_id' => $category->id,
                'featured' => false,
                'manage_stock' => true,
                'stock_status' => 'instock',
                'status' => 'active',
                'variants' => [
                    ['size' => 'S', 'color' => 'أخضر غابي', 'stock' => 10],
                    ['size' => 'M', 'color' => 'أخضر غابي', 'stock' => 15],
                    ['size' => 'L', 'color' => 'أخضر غابي', 'stock' => 20],
                    ['size' => 'XL', 'color' => 'أخضر غابي', 'stock' => 10],
                ],
            ],
            [
                'slug' => 'navy-wave-hoodie',
                'name' => 'Navy Wave',
                'name_arabic' => 'كحلي الموج',
                'description' => 'كحلي بحري عميق مستوحى من أمواج البحر المتوسط بتفاصيل مريحة للاستخدام في كافة الفصول.',
                'short_description' => 'كحلي بحري كلاسيكي بقصة مريحة.',
                'price' => 899,
                'compare_at_price' => 1150,
                'sku' => 'MRJ-NW-001',
                'image_url' => '/products/navy-wave-front.jpg',
                'side_url' => '/products/navy-wave-back.jpg',
                'category' => 'هوديز',
                'category_id' => $category->id,
                'featured' => false,
                'manage_stock' => true,
                'stock_status' => 'instock',
                'status' => 'active',
                'variants' => [
                    ['size' => 'S', 'color' => 'كحلي بحري', 'stock' => 12],
                    ['size' => 'M', 'color' => 'كحلي بحري', 'stock' => 18],
                    ['size' => 'L', 'color' => 'كحلي بحري', 'stock' => 20],
                    ['size' => 'XL', 'color' => 'كحلي بحري', 'stock' => 8],
                ],
            ],
        ];

        // Clean up any other old/inaccurate products
        $validSlugs = array_column($products, 'slug');
        CatalogProduct::whereNotIn('slug', $validSlugs)->delete();

        foreach ($products as $item) {
            $variants = $item['variants'];
            $sideUrl = $item['side_url'];
            unset($item['variants'], $item['side_url']);

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

            // Media setup (Front, Back/Side, and 3D)
            ProductMedia::updateOrCreate(
                ['product_id' => $product->id, 'media_type' => 'front'],
                ['url' => $item['image_url'], 'alt_text' => "الواجهة الأمامية لهودي {$product->name_arabic}", 'sort_order' => 1]
            );

            ProductMedia::updateOrCreate(
                ['product_id' => $product->id, 'media_type' => 'back'],
                ['url' => $sideUrl, 'alt_text' => "الجهة الخلفية لهودي {$product->name_arabic}", 'sort_order' => 2]
            );

            ProductMedia::updateOrCreate(
                ['product_id' => $product->id, 'media_type' => 'model3d'],
                ['url' => '/models/hoodie.glb', 'alt_text' => "مجسم 3D لهودي {$product->name_arabic}", 'sort_order' => 3]
            );
        }
    }
}
