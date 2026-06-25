import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  numeric,
  pgEnum,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["EMP", "RM", "APE", "CFO"]);

export const reimbursementStatusEnum = pgEnum("reimbursement_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(), // unique constraint on email

  password: text("password").notNull(), // stores bcrypt hashed password

  role: roleEnum("role").notNull().default("EMP"), // every new registration starts as EMP

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── Employee–Manager Relationship ───────────────────────────────────────────

export const employeeManager = pgTable(
  "employee_manager",
  {
    id: serial("id").primaryKey(),

    // integer FK → users.id  (the EMP)
    employeeId: integer("employee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // integer FK → users.id  (the RM)
    managerId: integer("manager_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    // one EMP reports to at most one RM — unique on employeeId
    uniqueEmployee: unique("uq_employee_manager_employee").on(table.employeeId),
  })
);

// ─── Reimbursements ───────────────────────────────────────────────────────────

export const reimbursements = pgTable("reimbursements", {
  id: serial("id").primaryKey(),

  // integer FK → users.id  (the EMP who raised the request)
  employeeId: integer("employee_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),

  description: text("description").notNull(), // required field

  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),

  // Overall request status — defaults to PENDING on creation
  status: reimbursementStatusEnum("status").notNull().default("PENDING"),

  // RM's decision — defaults to PENDING
  rmDecision: reimbursementStatusEnum("rm_decision").notNull().default("PENDING"),

  // APE's decision — defaults to PENDING
  apeDecision: reimbursementStatusEnum("ape_decision")
    .notNull()
    .default("PENDING"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
