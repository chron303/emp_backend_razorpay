import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";

const { Pool } = pkg;

// ─── Validate env ─────────────────────────────────────────────────────────────

if (!process.env.DATABASE_URL) {
  console.error("[migrate] ❌ DATABASE_URL is not set in .env");
  process.exit(1);
}

// ─── DB connection ────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// ─── Run migrations ───────────────────────────────────────────────────────────

async function runMigrations() {
  console.log("[migrate] 🚀 Starting database migrations...");
  console.log(`[migrate] 📂 Migrations folder: drizzle/migrations`);

  try {
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    console.log("[migrate] ✅ All migrations applied successfully.");
  } catch (err) {
    console.error("[migrate] ❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log("[migrate] 🔌 Database connection closed.");
  }
}

runMigrations();
