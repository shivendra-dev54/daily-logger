import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export interface IUserSchema {
  id?: number,
  username: string,
  full_name: string,
  email: string,
  password: string,
  refresh_token: string | null
}

export const users = mysqlTable("users", {
  id: int("id")
    .primaryKey()
    .autoincrement(),

  username: varchar("username", { length: 30 })
    .notNull()
    .unique(),

  full_name: varchar("full_name", { length: 50 })
    .notNull(),

  email: varchar("email", { length: 100 })
    .notNull()
    .unique(),

  password: varchar("password", { length: 500 })
    .notNull(),

  refresh_token: varchar("refresh_token", { length: 500 })
    .default("")

  // these are good to have but they are not necessary here
  // created_at: timestamp("created_at").defaultNow(),
  // updated_at: timestamp("updated_at").defaultNow()
});