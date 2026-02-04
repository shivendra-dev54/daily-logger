import { int, mysqlTable, timestamp } from "drizzle-orm/mysql-core";
import { users } from "./Users.schema";

export const sleep = mysqlTable('sleep', {
  id: int("id")
    .primaryKey()
    .notNull()
    .autoincrement(),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id),
  start_time: timestamp("start_time")
    .notNull(),
  end_time: timestamp("end_time")
    .notNull()

  // these are good to have but they are not necessary here
  // created_at: timestamp("created_at").defaultNow(),
  // updated_at: timestamp("updated_at").defaultNow()
});