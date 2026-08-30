CREATE TABLE `storeTeamInvites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenHash` varchar(128) NOT NULL,
	`role` enum('order_operator','catalog_editor','analytics_viewer','store_manager') NOT NULL,
	`createdByUserId` int NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`acceptedAt` timestamp,
	`acceptedByUserId` int,
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `storeTeamInvites_id` PRIMARY KEY(`id`),
	CONSTRAINT `storeTeamInvites_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `storeTeamMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('order_operator','catalog_editor','analytics_viewer','store_manager') NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeTeamMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `storeTeamMembers_userId_unique` UNIQUE(`userId`)
);
