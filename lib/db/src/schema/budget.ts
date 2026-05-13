import { pgTable, serial, numeric, text, char, timestamp } from "drizzle-orm/pg-core";

export const budgetTransactionsTable = pgTable("budget_transactions", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  month: char("month", { length: 7 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type BudgetTransaction = typeof budgetTransactionsTable.$inferSelect;
