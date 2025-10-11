// server/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../shared/schema"; // ✅ corrected import path
import dotenv from "dotenv";

dotenv.config();

// Use environment variable or fallback
const connectionString = process.env.DATABASE_URL || "postgresql://vanshuser:Intruder%4023@localhost:5432/projectdb";

// Disable prefetch since it’s not supported for Transaction pool mode
const client = postgres(connectionString, { prepare: false });

// Create drizzle database instance
export const db = drizzle(client, { schema });

console.log("✅ Connected to PostgreSQL successfully");
