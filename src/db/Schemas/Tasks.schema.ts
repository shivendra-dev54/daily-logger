import { date, int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { users } from "./Users.schema";

export interface ITasks {
  id?: number;
  title: string;
  body: string;
  user_id: number;
  status: string;
  due_date: Date;
}

export const tasks = mysqlTable('tasks', {
  id: int("id")
    .primaryKey()
    .notNull()
    .autoincrement(),
  title: varchar("title", { length: 100 })
    .notNull(),
  body: varchar("body", { length: 500 })
    .notNull(),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id),
  status: varchar("status", { length: 1 })
    .notNull()
    .default("P"),
  due_date: date("date")
    .notNull()

  // these are good to have but they are not necessary here
  // created_at: timestamp("created_at").defaultNow(),
  // updated_at: timestamp("updated_at").defaultNow()
});