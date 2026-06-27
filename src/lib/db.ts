import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const isVercel = !!process.env.VERCEL;
const dbPath = isVercel
  ? "/tmp/saathi.db"
  : path.join(process.cwd(), "dev.db");

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbReady: boolean;
};

function ensureSchema() {
  if (globalForPrisma.dbReady) return;

  const dbExists = fs.existsSync(dbPath);
  const raw = new Database(dbPath);

  if (!dbExists || isVercel) {
    const tables = raw
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all() as { name: string }[];
    const tableNames = new Set(tables.map((t) => t.name));

    if (!tableNames.has("User")) {
      raw.exec(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "city" TEXT NOT NULL,
          "monthlyBudget" INTEGER NOT NULL DEFAULT 8000
        );
        CREATE TABLE IF NOT EXISTS "Order" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "service" TEXT NOT NULL,
          "merchant" TEXT NOT NULL,
          "date" TEXT NOT NULL,
          "amount" INTEGER NOT NULL,
          "discount" INTEGER NOT NULL DEFAULT 0,
          "status" TEXT NOT NULL DEFAULT 'delivered',
          "placedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "items" TEXT NOT NULL DEFAULT '[]',
          CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );
        CREATE TABLE IF NOT EXISTS "MealHistory" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "dish" TEXT NOT NULL,
          "servings" INTEGER NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "MealHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );
        CREATE TABLE IF NOT EXISTS "HealthSnapshot" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "month" TEXT NOT NULL,
          "score" INTEGER NOT NULL,
          "data" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "HealthSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "HealthSnapshot_userId_month_key" ON "HealthSnapshot"("userId", "month");
      `);
    }
  }

  raw.close();
  globalForPrisma.dbReady = true;
}

function createClient() {
  ensureSchema();
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const seedGlobal = globalThis as unknown as { seedPromise: Promise<void> | undefined };
export function ensureDbReady(): Promise<void> {
  if (!isVercel) return Promise.resolve();
  if (!seedGlobal.seedPromise) {
    seedGlobal.seedPromise = import("./seed-runtime").then((m) => m.ensureSeeded());
  }
  return seedGlobal.seedPromise;
}
