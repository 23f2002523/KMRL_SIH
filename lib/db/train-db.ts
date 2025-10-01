import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as trainSchema from "./train-schema";

const sqlite = new Database("train-database.sqlite");
export const trainDb = drizzle(sqlite, { schema: trainSchema });

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");