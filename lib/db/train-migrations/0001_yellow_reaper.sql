CREATE TABLE `simulation_results` (
	`simulation_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`simulation_name` text NOT NULL,
	`parameters` text NOT NULL,
	`results` text NOT NULL,
	`status` text DEFAULT 'Running' NOT NULL,
	`start_time` integer DEFAULT CURRENT_TIMESTAMP,
	`end_time` integer,
	`created_by` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`created_by`) REFERENCES `train_users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `system_alerts` (
	`alert_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trainset_id` integer,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`priority` integer DEFAULT 1 NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`is_dismissed` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`trainset_id`) REFERENCES `trainsets`(`trainset_id`) ON UPDATE no action ON DELETE no action
);
