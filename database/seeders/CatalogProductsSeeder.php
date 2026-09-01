<?php

namespace Database\Seeders;

use App\Models\CatalogProduct;
use App\Models\ProductCategory;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class CatalogProductsSeeder extends Seeder {
    public function run(): void {
        $category = ProductCategory::updateOrCreate(
            ['slug' => 'hoodies'],
            [
                'name' => 'هوديز',
                'description' => 'المجموعة الأساسية من هوديز مرج المصنوعة من القطن الثقيل',
                'status' => 'active',
            ]
        );

        $products = [
            [
                'slug' => 'signal-red-hoodie',
                'name' => 'Signal Red',
                'name_arabic' => 'إشارة حمراء',
                'description' => 'هودي قطني ثقيل بقصة نظيفة وتفاصيل حمراء حادة. قطعة أساسية بلون لا يحتاج إلى شرح. صممنا إشارة حمراء من قطن ثقيل بملمس ناعم من الداخل، وقصة مريحة تحافظ على شكلها بعد يوم طويل.',
                'short_description' => 'هودي قطني ثقيل بقصة نظيفة وتفاصيل حمراء حادة.',
                'price' => 899,
                'compare_at_price' => 1100,
                'sku' => 'HF-SR-001',
                'image_url' => '/manus-storage/signal-red-front_ea8ae7ae.jpg',
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
                'description' => 'نسخة هادئة من الأساسيات، مصممة لتعيش مع كل إطلالة. أبيض ورقي ليس أبيضًا عاديًا. درجة دافئة وقماش كثيف يجعلان القطعة أساسًا نظيفًا لكل طبقاتك اليومية.',
                'short_description' => 'نسخة هادئة من الأساسيات، مصممة لتعيش مع كل إطلالة.',
                'price' => 849,
                'compare_at_price' => 1050,
                'sku' => 'HF-PW-001',
                'image_url' => '/manus-storage/paper-white-front_c5e44344.jpg',
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
                'slug' => 'night-grid-hoodie',
                'name' => 'Night Grid',
                'name_arabic' => 'شبكة ليلية',
                'description' => 'أسود عميق مع طباعة شبكية صغيرة لمحبي التفاصيل الهادئة. تفصيلة صغيرة تغيّر كل شيء. شبكة حمراء دقيقة على أسود ليلي عميق، مع قماش يحافظ على حضوره بدون ضوضاء.',
                'short_description' => 'أسود عميق مع طباعة شبكية صغيرة لمحبي التفاصيل الهادئة.',
                'price' => 949,
                'compare_at_price' => 1200,
                'sku' => 'HF-NG-001',
                'image_url' => '/manus-storage/night-grid-front_c4bb4ea5.jpg',
                'category' => 'هوديز',
                'category_id' => $category->id,
                'featured' => true,
                'manage_stock' => true,
                'stock_status' => 'instock',
                'status' => 'active',
                'variants' => [
                    ['size' => 'S', 'color' => 'أسود ليلي', 'stock' => 10],
                    ['size' => 'M', 'color' => 'أسود ليلي', 'stock' => 15],
                    ['size' => 'L', 'color' => 'أسود ليلي', 'stock' => 18],
                    ['size' => 'XL', 'color' => 'أسود ليلي', 'stock' => 8],
                ],
            ],
            [
                'slug' => 'concrete-grey-hoodie',
                'name' => 'Concrete Grey',
                'name_arabic' => 'رمادي خرسانة',
                'description' => 'توازن عملي بين الملمس الصناعي والراحة اليومية. رمادي محايد بقصة واسعة ومدروسة. قطعة سهلة، لكن ليست عادية؛ مناسبة للطبقات وللاستخدام اليومي المتكرر.',
                'short_description' => 'توازن عملي بين الملمس الصناعي والراحة اليومية.',
                'price' => 879,
                'compare_at_price' => 1100,
                'sku' => 'HF-CG-001',
                'image_url' => '/manus-storage/concrete-grey-front_a010e741.jpg',
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
        ];

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
        }
    }
}
