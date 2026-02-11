import { datetime, int, mysqlTable } from "drizzle-orm/mysql-core";
import { users } from "./Users.schema";

export interface ISleep {
  id?: number;
  user_id: number;
  start_time: string;
  end_time: string;
}

export const sleep = mysqlTable("sleep", {
  id: int("id").primaryKey().notNull().autoincrement(),
  user_id: int("user_id")
    .notNull()
    .references(() => users.id),
  start_time: datetime("start_time").notNull(),
  end_time: datetime("end_time").notNull(),
});