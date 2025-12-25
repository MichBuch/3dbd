import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
    // In build time or client side this might be empty, handle gracefully or throw
    // throw new Error('DATABASE_URL is not defined'); 
}

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
