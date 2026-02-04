import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable('users', {
  id: int("id")
    .primaryKey()
    .notNull()
    .autoincrement(),
  username: varchar("username", { length: 30 })
    .unique()
    .notNull(),
  full_name: varchar("username", { length: 50 })
    .unique()
    .notNull(),
  email: varchar("email", { length: 50 })
    .unique()
    .notNull(),
  password: varchar("password", { length: 500 })
    .notNull(),
  refresh_token: varchar("access_token", { length: 500 })
    .default(""),

  // these are good to have but they are not necessary here
  // created_at: timestamp("created_at").defaultNow(),
  // updated_at: timestamp("updated_at").defaultNow()
});