import { date, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { users } from "./Users.schema";

export interface ITasks {
  id?: number;
  title: string;
  body: string;
  user_id: number;
  status: string;
  due_date: Date;
}

export const tasks = pgTable('tasks', {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 })
    .notNull(),
  body: varchar("body", { length: 500 })
    .notNull(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  status: varchar("status", { length: 1 })
    .notNull()
    .default("P"),
  due_date: date("date")
    .notNull()
});