import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getSql } from "./shared/db";

const sql = getSql();
const migration = readFileSync(resolve("database/migrations/001_botjob_core.sql"), "utf8");

await sql.unsafe(migration);
await sql.close();

console.log("Migration 001_botjob_core.sql applied");
