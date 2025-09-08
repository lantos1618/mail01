import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const emails = sqliteTable("emails", {
  id: text("id").primaryKey(),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  cc: text("cc"),
  bcc: text("bcc"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  html: text("html"),
  folder: text("folder").notNull().default("inbox"),
  unread: integer("unread", { mode: "boolean" }).default(true),
  starred: integer("starred", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
})

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  provider: text("provider").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
})

export const labels = sqliteTable("labels", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
})

export const emailLabels = sqliteTable("email_labels", {
  emailId: text("email_id").notNull().references(() => emails.id),
  labelId: text("label_id").notNull().references(() => labels.id),
})