import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is not set. Using dummy connection string for build.");
}

const sql = neon(process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/db");
export const db = drizzle(sql, { schema });
