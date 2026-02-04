import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { users } from "./Users.schema";

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
  due_date: timestamp("due_date")
    .notNull()

  // these are good to have but they are not necessary here
  // created_at: timestamp("created_at").defaultNow(),
  // updated_at: timestamp("updated_at").defaultNow()
});