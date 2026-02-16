import { integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { users } from "./Users.schema";

export interface ISleep {
  id?: number;
  user_id: number;
  start_time: string;
  end_time: string;
}

export const sleep = pgTable("sleep", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time").notNull(),
});