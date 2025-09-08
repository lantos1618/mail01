import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "./schema"
import * as path from "path"
import * as fs from "fs"

let db: ReturnType<typeof drizzle>

export function initDb() {
  const dbPath = path.join(process.cwd(), ".agent", "mail01.db")
  const dbDir = path.dirname(dbPath)
  
  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
  
  const sqlite = new Database(dbPath)
  db = drizzle(sqlite, { schema })
  
  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      cc TEXT,
      bcc TEXT,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      html TEXT,
      folder TEXT NOT NULL DEFAULT 'inbox',
      unread BOOLEAN DEFAULT 1,
      starred BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      provider TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS labels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS email_labels (
      email_id TEXT NOT NULL,
      label_id TEXT NOT NULL,
      PRIMARY KEY (email_id, label_id),
      FOREIGN KEY (email_id) REFERENCES emails(id),
      FOREIGN KEY (label_id) REFERENCES labels(id)
    );
  `)
  
  return db
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized")
  }
  return db
}