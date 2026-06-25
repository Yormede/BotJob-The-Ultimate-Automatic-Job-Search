import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { getSql } from "./shared/db";

const sql = getSql();
const migrationDir = resolve("database/migrations");
const migrations = readdirSync(migrationDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

await sql`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

const existingCore = await sql`SELECT to_regclass('public.users') AS table_name`;
const applied = await sql<{ filename: string }[]>`SELECT filename FROM schema_migrations`;
const appliedNames = new Set(applied.map((row) => row.filename));

if (existingCore[0]?.table_name && !appliedNames.has("001_botjob_core.sql")) {
  await sql`INSERT INTO schema_migrations (filename) VALUES (${"001_botjob_core.sql"})`;
  appliedNames.add("001_botjob_core.sql");
}

for (const filename of migrations) {
  if (appliedNames.has(filename)) continue;
  const migration = readFileSync(resolve(migrationDir, filename), "utf8");
  await sql.unsafe(migration);
  await sql`INSERT INTO schema_migrations (filename) VALUES (${filename})`;
  console.log(`Migration ${filename} applied`);
}

await sql.close();
