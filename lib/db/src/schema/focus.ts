import { pgTable, serial, date, integer, timestamp } from "drizzle-orm/pg-core";

export const focusSessionsTable = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type FocusSession = typeof focusSessionsTable.$inferSelect;
