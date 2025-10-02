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
  role: text("role", { enum: ["Admin", "Operator", "Viewer"] }).notNull().default("Viewer"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// 9. System Alerts
export const systemAlerts = sqliteTable("system_alerts", {
  alertId: integer("alert_id").primaryKey({ autoIncrement: true }),
  trainsetId: integer("trainset_id").references(() => trainsets.trainsetId),
  type: text("type", { enum: ["Critical", "Warning", "Info", "Maintenance"] }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  priority: integer("priority").notNull().default(1), // 1=High, 2=Medium, 3=Low
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  isDismissed: integer("is_dismissed", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// 10. Simulation Results
export const simulationResults = sqliteTable("simulation_results", {
  simulationId: integer("simulation_id").primaryKey({ autoIncrement: true }),
  simulationName: text("simulation_name").notNull(),
  parameters: text("parameters").notNull(), // JSON string of simulation parameters
  results: text("results").notNull(), // JSON string of simulation results
  status: text("status", { enum: ["Running", "Completed", "Failed"] }).notNull().default("Running"),
  startTime: integer("start_time", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  endTime: integer("end_time", { mode: "timestamp" }),
  createdBy: integer("created_by").references(() => trainUsers.userId, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// 11. Uploaded Documents (for operator file uploads)
export const uploadedDocuments = sqliteTable("uploaded_documents", {
  documentId: integer("document_id").primaryKey({ autoIncrement: true }),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(), // 'excel', 'csv', 'pdf'
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  filePath: text("file_path").notNull(), // storage path
  uploadedBy: integer("uploaded_by").references(() => trainUsers.userId).notNull(),
  processingStatus: text("processing_status", { 
    enum: ["pending", "processing", "completed", "failed"] 
  }).notNull().default("pending"),
  errorMessage: text("error_message"),
  recordsProcessed: integer("records_processed").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// 12. Document Data Records (parsed data from Excel/CSV files)
export const documentDataRecords = sqliteTable("document_data_records", {
  recordId: integer("record_id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id").references(() => uploadedDocuments.documentId).notNull(),
  rowIndex: integer("row_index").notNull(), // row number in the original file
  columnData: text("column_data").notNull(), // JSON string of column key-value pairs
  dataType: text("data_type").notNull(), // 'trainset', 'maintenance', 'schedule', 'generic'
  isValid: integer("is_valid", { mode: "boolean" }).notNull().default(true),
  validationErrors: text("validation_errors"), // JSON array of validation errors
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});