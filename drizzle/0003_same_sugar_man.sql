CREATE TABLE `productCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text,
	`status` enum('active','draft') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `productCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `productMedia` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`url` text NOT NULL,
	`altText` varchar(180),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productMedia_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `catalogProducts` ADD `shortDescription` text;--> statement-breakpoint
ALTER TABLE `catalogProducts` ADD `salePrice` int;--> statement-breakpoint
ALTER TABLE `catalogProducts` ADD `compareAtPrice` int;--> statement-breakpoint
ALTER TABLE `catalogProducts` ADD `sku` varchar(80);--> statement-breakpoint
ALTER TABLE `catalogProducts` ADD `category` varchar(80) DEFAULT 'هوديز' NOT NULL;--> statement-breakpoint
ALTER TABLE `catalogProducts` ADD `categoryId` int;--> statement-breakpoint
ALTER TABLE `catalogProducts` ADD `featured` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `catalogProducts` ADD `manageStock` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `catalogProducts` ADD `stockStatus` enum('instock','outofstock','onbackorder') DEFAULT 'instock' NOT NULL;--> statement-breakpoint
ALTER TABLE `productVariants` ADD `color` varchar(80) DEFAULT 'أساسي' NOT NULL;--> statement-breakpoint
ALTER TABLE `productVariants` ADD `stockStatus` enum('instock','outofstock','onbackorder') DEFAULT 'instock' NOT NULL;--> statement-breakpoint
ALTER TABLE `productVariants` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `productVariants` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;