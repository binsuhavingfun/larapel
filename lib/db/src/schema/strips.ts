import { createInsertSchema } from "drizzle-zod";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const stripsTable = pgTable("strips", {
  id: varchar("id", { length: 64 }).primaryKey(),
  sessionId: varchar("session_id", { length: 128 }).notNull(),
  photos: text("photos").array().notNull(),
  note: varchar("note", { length: 180 }).notNull().default(""),
  placement: varchar("placement", { length: 10 }).notNull(),
  filter: varchar("filter", { length: 10 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStripSchema = createInsertSchema(stripsTable);
export type InsertStrip = z.infer<typeof insertStripSchema>;
export type Strip = typeof stripsTable.$inferSelect;