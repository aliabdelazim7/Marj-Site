CREATE TABLE `accountWishlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountWishlists_id` PRIMARY KEY(`id`),
	CONSTRAINT `accountWishlists_user_product_unique` UNIQUE(`userId`,`productId`)
);
--> statement-breakpoint
CREATE TABLE `commerceEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionKey` varchar(128) NOT NULL,
	`userId` int,
	`eventName` enum('product_view','add_to_cart','checkout_started','purchase_completed') NOT NULL,
	`productId` int,
	`orderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commerceEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(80) NOT NULL,
	`type` enum('percentage','fixed') NOT NULL,
	`value` int NOT NULL,
	`minimumSubtotal` int NOT NULL DEFAULT 0,
	`usageLimit` int,
	`usedCount` int NOT NULL DEFAULT 0,
	`startsAt` timestamp NOT NULL,
	`expiresAt` timestamp,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `inventoryAdjustments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`variantId` int NOT NULL,
	`delta` int NOT NULL,
	`resultingStock` int NOT NULL,
	`reason` varchar(240) NOT NULL,
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `inventoryAdjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lookbookEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(160) NOT NULL,
	`titleArabic` varchar(160) NOT NULL,
	`description` text,
	`imageUrl` text NOT NULL,
	`productId` int,
	`sortOrder` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lookbookEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyaltyAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyaltyAccounts_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyLedger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderId` int,
	`points` int NOT NULL,
	`type` enum('earned_delivery','redeemed_checkout','manual_adjustment') NOT NULL,
	`note` varchar(240),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loyaltyLedger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`customerName` varchar(160) NOT NULL,
	`rating` int NOT NULL,
	`body` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productReviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `productReviews_order_product_unique` UNIQUE(`orderId`,`productId`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `couponCode` varchar(80);--> statement-breakpoint
ALTER TABLE `orders` ADD `couponDiscount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipmentCarrier` varchar(120);--> statement-breakpoint
ALTER TABLE `orders` ADD `trackingNumber` varchar(160);--> statement-breakpoint
ALTER TABLE `orders` ADD `trackingUrl` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `loyaltyAwarded` boolean DEFAULT false NOT NULL;