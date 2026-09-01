-- ==============================================================================
-- مرج (Marj Hoodie Store) — Hostinger / MySQL / phpMyAdmin Full Schema & Seed Dump
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` int AUTO_INCREMENT NOT NULL,
  `openId` varchar(64) NOT NULL,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_openId_unique` (`openId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Store Team Members
CREATE TABLE IF NOT EXISTS `storeTeamMembers` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `role` enum('order_operator','catalog_editor','analytics_viewer','store_manager') NOT NULL,
  `createdByUserId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storeTeamMembers_userId_unique` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Store Team Invites
CREATE TABLE IF NOT EXISTS `storeTeamInvites` (
  `id` int AUTO_INCREMENT NOT NULL,
  `tokenHash` varchar(128) NOT NULL,
  `role` enum('order_operator','catalog_editor','analytics_viewer','store_manager') NOT NULL,
  `createdByUserId` int NOT NULL,
  `expiresAt` timestamp NULL,
  `acceptedAt` timestamp NULL,
  `acceptedByUserId` int NULL,
  `revokedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `storeTeamInvites_tokenHash_unique` (`tokenHash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Product Categories
CREATE TABLE IF NOT EXISTS `productCategories` (
  `id` int AUTO_INCREMENT NOT NULL,
  `slug` varchar(120) NOT NULL,
  `name` varchar(120) NOT NULL,
  `description` text,
  `status` enum('active','draft') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `productCategories_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Catalog Products
CREATE TABLE IF NOT EXISTS `catalogProducts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `slug` varchar(120) NOT NULL,
  `name` varchar(160) NOT NULL,
  `nameArabic` varchar(160) NOT NULL,
  `description` text NOT NULL,
  `shortDescription` text,
  `price` int NOT NULL,
  `salePrice` int NULL,
  `compareAtPrice` int NULL,
  `sku` varchar(80) NULL,
  `imageUrl` text NOT NULL,
  `category` varchar(80) NOT NULL DEFAULT 'هوديز',
  `categoryId` int NULL,
  `featured` boolean NOT NULL DEFAULT false,
  `manageStock` boolean NOT NULL DEFAULT true,
  `stockStatus` enum('instock','outofstock','onbackorder') NOT NULL DEFAULT 'instock',
  `status` enum('draft','active','archived') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `catalogProducts_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Product Variants
CREATE TABLE IF NOT EXISTS `productVariants` (
  `id` int AUTO_INCREMENT NOT NULL,
  `productId` int NOT NULL,
  `sku` varchar(80) NOT NULL,
  `size` varchar(8) NOT NULL,
  `color` varchar(80) NOT NULL DEFAULT 'أساسي',
  `stock` int NOT NULL DEFAULT 0,
  `safetyStock` int NOT NULL DEFAULT 3,
  `priceOverride` int NULL,
  `stockStatus` enum('instock','outofstock','onbackorder') NOT NULL DEFAULT 'instock',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `productVariants_sku_unique` (`sku`),
  KEY `productVariants_productId_idx` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Product Media
CREATE TABLE IF NOT EXISTS `productMedia` (
  `id` int AUTO_INCREMENT NOT NULL,
  `productId` int NOT NULL,
  `url` text NOT NULL,
  `mediaType` enum('front','back','gallery','model3d') NOT NULL DEFAULT 'gallery',
  `altText` varchar(180),
  `sortOrder` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `productMedia_productId_idx` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int AUTO_INCREMENT NOT NULL,
  `orderNumber` varchar(32) NOT NULL,
  `userId` int NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `customerName` varchar(160) NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(40) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(80) NOT NULL,
  `paymentMethod` varchar(40) NOT NULL DEFAULT 'cod',
  `couponCode` varchar(80) NULL,
  `couponDiscount` int NOT NULL DEFAULT 0,
  `shipmentCarrier` varchar(120) NULL,
  `trackingNumber` varchar(160) NULL,
  `trackingUrl` text NULL,
  `loyaltyAwarded` boolean NOT NULL DEFAULT false,
  `notes` text NULL,
  `subtotal` int NOT NULL,
  `shipping` int NOT NULL,
  `total` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_orderNumber_unique` (`orderNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Order Items
CREATE TABLE IF NOT EXISTS `orderItems` (
  `id` int AUTO_INCREMENT NOT NULL,
  `orderId` int NOT NULL,
  `productId` varchar(80) NOT NULL,
  `productName` varchar(160) NOT NULL,
  `size` varchar(8) NOT NULL,
  `quantity` int NOT NULL,
  `unitPrice` int NOT NULL,
  `lineTotal` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderItems_orderId_idx` (`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Coupons
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` int AUTO_INCREMENT NOT NULL,
  `code` varchar(80) NOT NULL,
  `type` enum('percentage','fixed') NOT NULL,
  `value` int NOT NULL,
  `minimumSubtotal` int NOT NULL DEFAULT 0,
  `usageLimit` int NULL,
  `usedCount` int NOT NULL DEFAULT 0,
  `startsAt` timestamp NOT NULL,
  `expiresAt` timestamp NULL,
  `enabled` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Product Reviews
CREATE TABLE IF NOT EXISTS `productReviews` (
  `id` int AUTO_INCREMENT NOT NULL,
  `orderId` int NOT NULL,
  `productId` int NOT NULL,
  `customerName` varchar(160) NOT NULL,
  `rating` int NOT NULL,
  `body` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `productReviews_order_product_unique` (`orderId`, `productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Account Wishlists
CREATE TABLE IF NOT EXISTS `accountWishlists` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `productId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accountWishlists_user_product_unique` (`userId`, `productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Loyalty Accounts
CREATE TABLE IF NOT EXISTS `loyaltyAccounts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `points` int NOT NULL DEFAULT 0,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `loyaltyAccounts_userId_unique` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Loyalty Ledger
CREATE TABLE IF NOT EXISTS `loyaltyLedger` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `orderId` int NULL,
  `points` int NOT NULL,
  `type` enum('earned_delivery','redeemed_checkout','manual_adjustment') NOT NULL,
  `note` varchar(240) NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `loyaltyLedger_userId_idx` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Inventory Adjustments
CREATE TABLE IF NOT EXISTS `inventoryAdjustments` (
  `id` int AUTO_INCREMENT NOT NULL,
  `variantId` int NOT NULL,
  `delta` int NOT NULL,
  `resultingStock` int NOT NULL,
  `reason` varchar(240) NOT NULL,
  `createdByUserId` int NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `inventoryAdjustments_variantId_idx` (`variantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Lookbook Entries
CREATE TABLE IF NOT EXISTS `lookbookEntries` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` varchar(160) NOT NULL,
  `titleArabic` varchar(160) NOT NULL,
  `description` text,
  `imageUrl` text NOT NULL,
  `productId` int NULL,
  `sortOrder` int NOT NULL DEFAULT 0,
  `published` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Commerce Events
CREATE TABLE IF NOT EXISTS `commerceEvents` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sessionKey` varchar(128) NOT NULL,
  `userId` int NULL,
  `eventName` enum('product_view','add_to_cart','checkout_started','purchase_completed') NOT NULL,
  `productId` int NULL,
  `orderId` int NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `commerceEvents_sessionKey_idx` (`sessionKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. Store Settings
CREATE TABLE IF NOT EXISTS `storeSettings` (
  `id` int AUTO_INCREMENT NOT NULL,
  `brandName` varchar(120) NOT NULL DEFAULT 'مرج',
  `shippingScope` varchar(240) NOT NULL DEFAULT 'الشحن متاح لجميع محافظات مصر',
  `shippingFee` int NOT NULL DEFAULT 0,
  `freeShippingThreshold` int NULL,
  `shippingNotice` text NOT NULL,
  `returnPolicy` text NOT NULL,
  `paymentNotice` text NOT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. Shipping Zones
CREATE TABLE IF NOT EXISTS `shippingZones` (
  `id` int AUTO_INCREMENT NOT NULL,
  `governorate` varchar(80) NOT NULL,
  `fee` int NOT NULL DEFAULT 0,
  `deliveryNote` varchar(240),
  `enabled` boolean NOT NULL DEFAULT true,
  `sortOrder` int NOT NULL DEFAULT 0,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shippingZones_governorate_unique` (`governorate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. Payment Methods
CREATE TABLE IF NOT EXISTS `paymentMethods` (
  `id` int AUTO_INCREMENT NOT NULL,
  `code` varchar(40) NOT NULL,
  `label` varchar(120) NOT NULL,
  `type` enum('cod','manual_transfer','online_card') NOT NULL,
  `enabled` boolean NOT NULL DEFAULT false,
  `instructions` text,
  `whatsappNumber` varchar(16) NULL,
  `sortOrder` int NOT NULL DEFAULT 0,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `paymentMethods_code_unique` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. Carts
CREATE TABLE IF NOT EXISTS `carts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `sessionKey` varchar(128) NOT NULL,
  `userId` int NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `carts_sessionKey_unique` (`sessionKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. Cart Items
CREATE TABLE IF NOT EXISTS `cartItems` (
  `id` int AUTO_INCREMENT NOT NULL,
  `cartId` int NOT NULL,
  `variantId` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cartItems_cartId_idx` (`cartId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- SEED DATA (بيانات التشغيل الأساسية)
-- ==============================================================================

-- Store Settings Default
INSERT INTO `storeSettings` (`id`, `brandName`, `shippingScope`, `shippingFee`, `freeShippingThreshold`, `shippingNotice`, `returnPolicy`, `paymentNotice`)
VALUES (1, 'مرج', 'الشحن متاح لجميع محافظات مصر', 50, 2000, 'الشحن يتم عبر شركات شحن معتمدة خلال 2-4 أيام عمل.', 'استبدال واسترجاع مجاني خلال 14 يومًا من تاريخ الاستلام بشرط سلامة المنتج.', 'الدفع متاح عند الاستلام أو عبر المحافظ الإلكترونية وInstaPay.')
ON DUPLICATE KEY UPDATE `brandName` = VALUES(`brandName`);

-- Payment Methods Default
INSERT INTO `paymentMethods` (`code`, `label`, `type`, `enabled`, `instructions`, `whatsappNumber`, `sortOrder`)
VALUES
('cod', 'الدفع عند الاستلام (COD)', 'cod', 1, 'يتم سداد إجمالي المبلغ نقدًا للمندوب عند استلام الشحنة.', NULL, 1),
('manual_transfer', 'تحويل محفظة إلكترونية / InstaPay', 'manual_transfer', 0, 'قم بالتحويل على رقم المحفظة ثم أرسل صورة الإيصال عبر WhatsApp.', '01012345678', 2),
('online_card', 'بطاقة بنكية (فيزا / ماستركارد)', 'online_card', 0, 'الدفع الإلكتروني المباشر (يتطلب ربط بوابة دفع).', NULL, 3)
ON DUPLICATE KEY UPDATE `label` = VALUES(`label`);

-- Egyptian Governorates Shipping Zones Default
INSERT INTO `shippingZones` (`governorate`, `fee`, `deliveryNote`, `enabled`, `sortOrder`)
VALUES
('القاهرة', 45, 'توصيل خلال 24-48 ساعة', 1, 1),
('الجيزة', 45, 'توصيل خلال 24-48 ساعة', 1, 2),
('الإسكندرية', 55, 'توصيل خلال 48 ساعة', 1, 3),
('القليوبية', 50, 'توصيل خلال 2-3 أيام', 1, 4),
('الشرقية', 55, 'توصيل خلال 2-3 أيام', 1, 5),
('الدقهلية', 55, 'توصيل خلال 2-3 أيام', 1, 6),
('الغربية', 55, 'توصيل خلال 2-3 أيام', 1, 7),
('المنوفية', 55, 'توصيل خلال 2-3 أيام', 1, 8),
('البحيرة', 55, 'توصيل خلال 2-3 أيام', 1, 9),
('كفر الشيخ', 60, 'توصيل خلال 2-3 أيام', 1, 10),
('دمياط', 60, 'توصيل خلال 2-3 أيام', 1, 11),
('بورسعيد', 60, 'توصيل خلال 2-3 أيام', 1, 12),
('الإسماعيلية', 60, 'توصيل خلال 2-3 أيام', 1, 13),
('السويس', 60, 'توصيل خلال 2-3 أيام', 1, 14),
('الفيوم', 65, 'توصيل خلال 3-4 أيام', 1, 15),
('بني سويف', 65, 'توصيل خلال 3-4 أيام', 1, 16),
('المنيا', 70, 'توصيل خلال 3-4 أيام', 1, 17),
('أسيوط', 75, 'توصيل خلال 3-4 أيام', 1, 18),
('سوهاج', 75, 'توصيل خلال 3-4 أيام', 1, 19),
('قنا', 80, 'توصيل خلال 3-5 أيام', 1, 20),
('الأقصر', 85, 'توصيل خلال 3-5 أيام', 1, 21),
('أسوان', 85, 'توصيل خلال 3-5 أيام', 1, 22),
('البحر الأحمر', 85, 'توصيل خلال 3-5 أيام', 1, 23),
('مطروح', 85, 'توصيل خلال 3-5 أيام', 1, 24),
('شمال سيناء', 90, 'توصيل خلال 4-6 أيام', 1, 25),
('جنوب سيناء', 90, 'توصيل خلال 4-6 أيام', 1, 26),
('الوادي الجديد', 95, 'توصيل خلال 4-6 أيام', 1, 27)
ON DUPLICATE KEY UPDATE `fee` = VALUES(`fee`);

-- Default Category
INSERT INTO `productCategories` (`id`, `slug`, `name`, `description`, `status`)
VALUES (1, 'hoodies', 'هوديز', 'المجموعة الأساسية من هوديز مرج المصنوعة من القطن الثقيل', 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Default Products
INSERT INTO `catalogProducts` (`id`, `slug`, `name`, `nameArabic`, `description`, `shortDescription`, `price`, `salePrice`, `compareAtPrice`, `sku`, `imageUrl`, `category`, `categoryId`, `featured`, `manageStock`, `stockStatus`, `status`)
VALUES
(1, 'signal-red-hoodie', 'Signal Red', 'إشارة حمراء', 'هودي قطني ثقيل بقصة نظيفة وتفاصيل حمراء حادة. قطعة أساسية بلون لا يحتاج إلى شرح. صممنا إشارة حمراء من قطن ثقيل بملمس ناعم من الداخل، وقصة مريحة تحافظ على شكلها بعد يوم طويل.', 'هودي قطني ثقيل بقصة نظيفة وتفاصيل حمراء حادة.', 899, NULL, 1100, 'HF-SR-001', '/manus-storage/signal-red-front_ea8ae7ae.jpg', 'هوديز', 1, 1, 1, 'instock', 'active'),
(2, 'paper-white-hoodie', 'Paper White', 'أبيض ورقي', 'نسخة هادئة من الأساسيات، مصممة لتعيش مع كل إطلالة. أبيض ورقي ليس أبيضًا عاديًا. درجة دافئة وقماش كثيف يجعلان القطعة أساسًا نظيفًا لكل طبقاتك اليومية.', 'نسخة هادئة من الأساسيات، مصممة لتعيش مع كل إطلالة.', 849, NULL, 1050, 'HF-PW-001', '/manus-storage/paper-white-front_c5e44344.jpg', 'هوديز', 1, 1, 1, 'instock', 'active'),
(3, 'night-grid-hoodie', 'Night Grid', 'شبكة ليلية', 'أسود عميق مع طباعة شبكية صغيرة لمحبي التفاصيل الهادئة. تفصيلة صغيرة تغيّر كل شيء. شبكة حمراء دقيقة على أسود ليلي عميق، مع قماش يحافظ على حضوره بدون ضوضاء.', 'أسود عميق مع طباعة شبكية صغيرة لمحبي التفاصيل الهادئة.', 949, NULL, 1200, 'HF-NG-001', '/manus-storage/night-grid-front_c4bb4ea5.jpg', 'هوديز', 1, 1, 1, 'instock', 'active'),
(4, 'concrete-grey-hoodie', 'Concrete Grey', 'رمادي خرسانة', 'توازن عملي بين الملمس الصناعي والراحة اليومية. رمادي محايد بقصة واسعة ومدروسة. قطعة سهلة، لكن ليست عادية؛ مناسبة للطبقات وللاستخدام اليومي المتكرر.', 'توازن عملي بين الملمس الصناعي والراحة اليومية.', 879, NULL, 1100, 'HF-CG-001', '/manus-storage/concrete-grey-front_a010e741.jpg', 'هوديز', 1, 1, 1, 'instock', 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Default Variants for Product 1 (Signal Red)
INSERT INTO `productVariants` (`productId`, `sku`, `size`, `color`, `stock`, `safetyStock`, `stockStatus`, `status`)
VALUES
(1, 'HF-SR-S', 'S', 'أحمر إشارة', 15, 3, 'instock', 'active'),
(1, 'HF-SR-M', 'M', 'أحمر إشارة', 20, 3, 'instock', 'active'),
(1, 'HF-SR-L', 'L', 'أحمر إشارة', 25, 3, 'instock', 'active'),
(1, 'HF-SR-XL', 'XL', 'أحمر إشارة', 15, 3, 'instock', 'active')
ON DUPLICATE KEY UPDATE `stock` = VALUES(`stock`);

-- Default Variants for Product 2 (Paper White)
INSERT INTO `productVariants` (`productId`, `sku`, `size`, `color`, `stock`, `safetyStock`, `stockStatus`, `status`)
VALUES
(2, 'HF-PW-S', 'S', 'أبيض ناصع', 12, 3, 'instock', 'active'),
(2, 'HF-PW-M', 'M', 'أبيض ناصع', 18, 3, 'instock', 'active'),
(2, 'HF-PW-L', 'L', 'أبيض ناصع', 22, 3, 'instock', 'active'),
(2, 'HF-PW-XL', 'XL', 'أبيض ناصع', 14, 3, 'instock', 'active')
ON DUPLICATE KEY UPDATE `stock` = VALUES(`stock`);

-- Default Variants for Product 3 (Night Grid)
INSERT INTO `productVariants` (`productId`, `sku`, `size`, `color`, `stock`, `safetyStock`, `stockStatus`, `status`)
VALUES
(3, 'HF-NG-S', 'S', 'أسود ليلي', 10, 3, 'instock', 'active'),
(3, 'HF-NG-M', 'M', 'أسود ليلي', 15, 3, 'instock', 'active'),
(3, 'HF-NG-L', 'L', 'أسود ليلي', 18, 3, 'instock', 'active'),
(3, 'HF-NG-XL', 'XL', 'أسود ليلي', 8, 3, 'instock', 'active')
ON DUPLICATE KEY UPDATE `stock` = VALUES(`stock`);

-- Default Variants for Product 4 (Concrete Grey)
INSERT INTO `productVariants` (`productId`, `sku`, `size`, `color`, `stock`, `safetyStock`, `stockStatus`, `status`)
VALUES
(4, 'HF-CG-S', 'S', 'رمادي خرسانة', 14, 3, 'instock', 'active'),
(4, 'HF-CG-M', 'M', 'رمادي خرسانة', 20, 3, 'instock', 'active'),
(4, 'HF-CG-L', 'L', 'رمادي خرسانة', 25, 3, 'instock', 'active'),
(4, 'HF-CG-XL', 'XL', 'رمادي خرسانة', 12, 3, 'instock', 'active')
ON DUPLICATE KEY UPDATE `stock` = VALUES(`stock`);

SET FOREIGN_KEY_CHECKS = 1;
