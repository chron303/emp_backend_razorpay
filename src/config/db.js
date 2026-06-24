import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../../drizzle/schema.js";
import * as relations from "../../drizzle/relations.js";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema: { ...schema, ...relations } });
