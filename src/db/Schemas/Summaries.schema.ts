import {
  date,
  integer,
  pgTable,
  serial,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./Users.schema";

export interface ISummaries {
  id?: number;
  user_id: number;
  summary: string;
  rating: number;
  date: Date;
}

export const summaries = pgTable(
  "summaries",
  {
    id: serial("id").primaryKey(),

    user_id: integer("user_id")
      .notNull()
      .references(() => users.id),

    summary: varchar("summary", { length: 1000 }).notNull(),

    rating: integer("rating").notNull().default(2),

    date: date("date").notNull(),
  },
  (table) => [
    uniqueIndex("user_date_unique").on(table.user_id, table.date),
  ]
);