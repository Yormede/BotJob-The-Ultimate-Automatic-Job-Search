export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required");
  }

  return new Bun.SQL(process.env.DATABASE_URL);
}

export async function pingDatabase() {
  const sql = getSql();
  const rows = await sql`SELECT 1 AS ok`;
  await sql.close();
  return rows[0]?.ok === 1;
}
