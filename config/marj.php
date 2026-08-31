<?php

return [
    'brand_name' => 'مرج',
    'brand_name_en' => 'Marj',
    'tagline' => 'هوديز قطنية فاخرة بتفاصيل مستوحاة من البحر والموج',
    'loyalty' => [
        'points_per_egp' => 0.1, // 1 point for every 10 EGP
        'discount_per_point' => 1, // 1 point = 1 EGP discount
    ],
    'safety_stock_threshold' => 3,
    'shipping' => [
        'default_fee' => 50,
        'free_shipping_threshold' => 2000,
    ],
    'whatsapp' => [
        'default_number' => '01012345678',
    ],
    'forge' => [
        'url' => env('BUILT_IN_FORGE_API_URL'),
        'key' => env('BUILT_IN_FORGE_API_KEY'),
    ],
];
