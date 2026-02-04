CREATE TABLE `sleep` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`start_time` timestamp NOT NULL,
	`end_time` timestamp NOT NULL,
	CONSTRAINT `sleep_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `summaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`summary` varchar(1000) NOT NULL,
	`rating` int NOT NULL DEFAULT 2,
	`date` timestamp NOT NULL,
	CONSTRAINT `summaries_id` PRIMARY KEY(`id`),
	CONSTRAINT `summaries_date_unique` UNIQUE(`date`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(100) NOT NULL,
	`body` varchar(500) NOT NULL,
	`user_id` int NOT NULL,
	`status` varchar(1) NOT NULL DEFAULT 'P',
	`due_date` timestamp NOT NULL,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(30) NOT NULL,
	`full_name` varchar(50) NOT NULL,
	`email` varchar(100) NOT NULL,
	`password` varchar(500) NOT NULL,
	`refresh_token` varchar(500) DEFAULT '',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `sleep` ADD CONSTRAINT `sleep_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `summaries` ADD CONSTRAINT `summaries_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;