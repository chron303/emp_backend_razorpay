import "dotenv/config";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

import { users } from "./schema.js";
import { ROLES } from "../src/enums/roles.enum.js";

const { Pool } = pkg;

// ─── DB connection ────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

// ─── CFO seed data ────────────────────────────────────────────────────────────

const CFO_EMAIL    = "cfo@org.com";
const CFO_PASSWORD = "CFO#ORG@April2026";
const SALT_ROUNDS  = 10;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("[seed] 🌱 Starting seed process...");

  try {
    // 1. Check if CFO already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, CFO_EMAIL))
      .limit(1);

    if (existing.length > 0) {
      console.log(`[seed] ⚠️  CFO account already exists (email: ${CFO_EMAIL}). Skipping creation.`);
      return;
    }

    // 2. Hash the password
    console.log("[seed] 🔐 Hashing CFO password...");
    const hashedPassword = await bcrypt.hash(CFO_PASSWORD, SALT_ROUNDS);

    // 3. Insert CFO account
    await db.insert(users).values({
      name:     "CFO",
      email:    CFO_EMAIL,
      password: hashedPassword,
      role:     ROLES.CFO,
    });

    console.log(`[seed] ✅ CFO account created successfully (email: ${CFO_EMAIL}).`);

  } catch (err) {
    console.error("[seed] ❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log("[seed] 🔌 Database connection closed.");
  }
}

seed();
