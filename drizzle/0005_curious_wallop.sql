CREATE TABLE `storeSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandName` varchar(120) NOT NULL DEFAULT 'مرج',
	`shippingScope` varchar(240) NOT NULL DEFAULT 'الشحن متاح لجميع محافظات مصر',
	`shippingNotice` text NOT NULL,
	`returnPolicy` text NOT NULL,
	`paymentNotice` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeSettings_id` PRIMARY KEY(`id`)
);
