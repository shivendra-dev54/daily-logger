import {
  date,
  int,
  mysqlTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";
import { users } from "./Users.schema";

export interface ISummaries {
  id?: number;
  user_id: number;
  summary: string;
  rating: number;
  date: Date;
}

export const summaries = mysqlTable(
  "summaries",
  {
    id: int("id").primaryKey().notNull().autoincrement(),

    user_id: int("user_id")
      .notNull()
      .references(() => users.id),

    summary: varchar("summary", { length: 1000 }).notNull(),

    rating: int("rating").notNull().default(2),

    date: date("date").notNull(),
  },
  (table) => [
    uniqueIndex("user_date_unique").on(table.user_id, table.date),
  ]
);
