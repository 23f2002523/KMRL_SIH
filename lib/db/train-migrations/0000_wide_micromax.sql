CREATE TABLE `branding_priorities` (
	`branding_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trainset_id` integer NOT NULL,
	`campaign_name` text NOT NULL,
	`allocated_hours` integer DEFAULT 0 NOT NULL,
	`consumed_hours` integer DEFAULT 0 NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`trainset_id`) REFERENCES `trainsets`(`trainset_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cleaning_slots` (
	`cleaning_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trainset_id` integer NOT NULL,
	`cleaning_type` text NOT NULL,
	`slot_time` integer NOT NULL,
	`manpower_required` integer DEFAULT 0 NOT NULL,
	`manpower_allocated` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`trainset_id`) REFERENCES `trainsets`(`trainset_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fitness_certificates` (
	`certificate_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trainset_id` integer NOT NULL,
	`dept` text NOT NULL,
	`valid_from` integer NOT NULL,
	`valid_to` integer NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`trainset_id`) REFERENCES `trainsets`(`trainset_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `induction_plans` (
	`plan_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` integer NOT NULL,
	`trainset_id` integer NOT NULL,
	`decision` text NOT NULL,
	`reason` text NOT NULL,
	`generated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`trainset_id`) REFERENCES `trainsets`(`trainset_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `job_cards` (
	`jobcard_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trainset_id` integer NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'Open' NOT NULL,
	`raised_date` integer NOT NULL,
	`closed_date` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`trainset_id`) REFERENCES `trainsets`(`trainset_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stabling_geometry` (
	`stable_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trainset_id` integer NOT NULL,
	`depot` text NOT NULL,
	`bay_no` integer NOT NULL,
	`position_order` integer NOT NULL,
	`is_ready_for_turnout` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`trainset_id`) REFERENCES `trainsets`(`trainset_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `train_users` (
	`user_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'Viewer' NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `train_users_email_unique` ON `train_users` (`email`);--> statement-breakpoint
CREATE TABLE `trainsets` (
	`trainset_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`serial_no` text NOT NULL,
	`status` text DEFAULT 'Active' NOT NULL,
	`mileage_km` integer DEFAULT 0 NOT NULL,
	`last_service_date` integer,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trainsets_serial_no_unique` ON `trainsets` (`serial_no`);