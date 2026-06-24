import { relations } from "drizzle-orm";
import { users, employeeManager, reimbursements } from "./schema.js";

// ─── Users Relations ──────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one, many }) => ({
  // A user (EMP) can appear as the employee in one employee_manager record
  employeeManagerAsEmployee: one(employeeManager, {
    fields: [users.id],
    references: [employeeManager.employeeId],
    relationName: "employee",
  }),

  // A user (RM) can appear as the manager in many employee_manager records
  employeeManagerAsManager: many(employeeManager, {
    relationName: "manager",
  }),

  // A user (EMP) can create many reimbursements
  reimbursements: many(reimbursements),
}));

// ─── Employee–Manager Relations ───────────────────────────────────────────────

export const employeeManagerRelations = relations(
  employeeManager,
  ({ one }) => ({
    // Each record belongs to one employee user
    employee: one(users, {
      fields: [employeeManager.employeeId],
      references: [users.id],
      relationName: "employee",
    }),

    // Each record belongs to one manager user
    manager: one(users, {
      fields: [employeeManager.managerId],
      references: [users.id],
      relationName: "manager",
    }),
  })
);

// ─── Reimbursements Relations ─────────────────────────────────────────────────

export const reimbursementsRelations = relations(reimbursements, ({ one }) => ({
  // Each reimbursement belongs to one employee user
  employee: one(users, {
    fields: [reimbursements.employeeId],
    references: [users.id],
  }),
}));
