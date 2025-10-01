import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, blob } from "drizzle-orm/sqlite-core";

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "employee", "viewer"] }).notNull().default("employee"),
  department: text("department"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Documents table
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  status: text("status", { enum: ["active", "archived", "draft"] }).notNull().default("active"),
  tags: text("tags"), // JSON string of tags
  category: text("category"),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Document versions table (for version control)
export const documentVersions = sqliteTable("document_versions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  version: integer("version").notNull(),
  filePath: text("file_path").notNull(),
  changes: text("changes"), // Description of changes
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Document analytics table
export const documentAnalytics = sqliteTable("document_analytics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  documentId: integer("document_id").references(() => documents.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  action: text("action", { enum: ["view", "download", "search", "share", "upload"] }).notNull(),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Notifications table
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type", { enum: ["info", "warning", "success", "error"] }).notNull().default("info"),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  relatedDocumentId: integer("related_document_id").references(() => documents.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Workflows table
export const workflows = sqliteTable("workflows", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { enum: ["active", "inactive", "completed"] }).notNull().default("active"),
  steps: text("steps"), // JSON string of workflow steps
  assignedTo: integer("assigned_to").references(() => users.id),
  documentId: integer("document_id").references(() => documents.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// Search history table
export const searchHistory = sqliteTable("search_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  query: text("query").notNull(),
  resultsCount: integer("results_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

// System settings table
export const systemSettings = sqliteTable("system_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: integer("updated_by").references(() => users.id),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});