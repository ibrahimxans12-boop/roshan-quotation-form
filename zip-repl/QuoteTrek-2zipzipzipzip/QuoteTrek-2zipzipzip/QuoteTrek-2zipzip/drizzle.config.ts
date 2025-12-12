import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const dbUrl = process.env.DATABASE_URL;
const sslUrl = dbUrl.includes('?') ? `${dbUrl}&sslmode=require` : `${dbUrl}?sslmode=require`;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NODE_ENV === 'production' ? sslUrl : dbUrl,
  },
});
