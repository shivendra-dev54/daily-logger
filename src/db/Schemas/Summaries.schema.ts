import { int, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { users } from "./Users.schema";

export const summaries = mysqlTable('summaries', {
  id: int("id")
    .primaryKey()
    .notNull()
    .autoincrement(),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id),
  summary: varchar("summary", { length: 1000 }).notNull(),
  rating: int("rating")
    .notNull()
    .default(2),
  date: timestamp("date")
    .notNull()
    .unique()

  // these are good to have but they are not necessary here
  // created_at: timestamp("created_at").defaultNow(),
  // updated_at: timestamp("updated_at").defaultNow()
});