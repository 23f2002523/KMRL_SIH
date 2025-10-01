import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

// 1. Trainsets (master table)
export const trainsets = sqliteTable("trainsets", {
  trainsetId: integer("trainset_id").primaryKey({ autoIncrement: true }),
  serialNo: text("serial_no").notNull().unique(),
  status: text("status", { enum: ["Active", "Standby", "Maintenance"] }).notNull().default("Active"),
  mileageKm: integer("mileage_km").notNull().default(0),
  lastServiceDate: integer("last_service_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// 2. Fitness Certificates
export const fitnessCertificates = sqliteTable("fitness_certificates", {
  certificateId: integer("certificate_id").primaryKey({ autoIncrement: true }),
  trainsetId: integer("trainset_id").references(() => trainsets.trainsetId).notNull(),
  dept: text("dept", { enum: ["RollingStock", "Signalling", "Telecom"] }).notNull(),
  validFrom: integer("valid_from", { mode: "timestamp" }).notNull(),
  validTo: integer("valid_to", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: ["Valid", "Expired", "Pending"] }).notNull().default("Pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// 3. Job Cards (maintenance work orders)
export const jobCards = sqliteTable("job_cards", {
  jobcardId: integer("jobcard_id").primaryKey({ autoIncrement: true }),
  trainsetId: integer("trainset_id").references(() => trainsets.trainsetId).notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["Open", "Closed", "InProgress"] }).notNull().default("Open"),
  raisedDate: integer("raised_date", { mode: "timestamp" }).notNull(),
  closedDate: integer("closed_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// 4. Branding Priorities
export const brandingPriorities = sqliteTable("branding_priorities", {
  brandingId: integer("branding_id").primaryKey({ autoIncrement: true }),
  trainsetId: integer("trainset_id").references(() => trainsets.trainsetId).notNull(),
  campaignName: text("campaign_name").notNull(),
  allocatedHours: integer("allocated_hours").notNull().default(0),
  consumedHours: integer("consumed_hours").notNull().default(0),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  endDate: integer("end_date", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// 5. Cleaning Slots
export const cleaningSlots = sqliteTable("cleaning_slots", {
  cleaningId: integer("cleaning_id").primaryKey({ autoIncrement: true }),
  trainsetId: integer("trainset_id").references(() => trainsets.trainsetId).notNull(),
  cleaningType: text("cleaning_type", { enum: ["Daily", "Deep", "Detailing"] }).notNull(),
  slotTime: integer("slot_time", { mode: "timestamp" }).notNull(),
  manpowerRequired: integer("manpower_required").notNull().default(0),
  manpowerAllocated: integer("manpower_allocated").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// 6. Stabling Geometry
export const stablingGeometry = sqliteTable("stabling_geometry", {
  stableId: integer("stable_id").primaryKey({ autoIncrement: true }),
  trainsetId: integer("trainset_id").references(() => trainsets.trainsetId).notNull(),
  depot: text("depot", { enum: ["Depot1", "Depot2"] }).notNull(),
  bayNo: integer("bay_no").notNull(),
  positionOrder: integer("position_order").notNull(),
  isReadyForTurnout: integer("is_ready_for_turnout", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// 7. Induction Plans (generated output)
export const inductionPlans = sqliteTable("induction_plans", {
  planId: integer("plan_id").primaryKey({ autoIncrement: true }),
  date: integer("date", { mode: "timestamp" }).notNull(),
  trainsetId: integer("trainset_id").references(() => trainsets.trainsetId).notNull(),
  decision: text("decision", { enum: ["Service", "Standby", "Maintenance"] }).notNull(),
  reason: text("reason").notNull(),
  generatedAt: integer("generated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// 8. Train Users (extending existing users table for train-specific roles)
export const trainUsers = sqliteTable("train_users", {
  userId: integer("user_id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role", { enum: ["Admin", "Planner", "Viewer"] }).notNull().default("Viewer"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});