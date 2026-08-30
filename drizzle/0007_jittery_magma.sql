CREATE TABLE `paymentMethods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(40) NOT NULL,
	`label` varchar(120) NOT NULL,
	`type` enum('cod','manual_transfer','online_card') NOT NULL,
	`enabled` boolean NOT NULL DEFAULT false,
	`instructions` text,
	`sortOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentMethods_id` PRIMARY KEY(`id`),
	CONSTRAINT `paymentMethods_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `shippingZones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`governorate` varchar(80) NOT NULL,
	`fee` int NOT NULL DEFAULT 0,
	`deliveryNote` varchar(240),
	`enabled` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shippingZones_id` PRIMARY KEY(`id`),
	CONSTRAINT `shippingZones_governorate_unique` UNIQUE(`governorate`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentMethod` varchar(40) DEFAULT 'cod' NOT NULL;