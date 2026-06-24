import type { SqlClient } from "../auth/auth.repository";

export type JobAxisInput = {
  title: string;
  description: string;
  contractTypes: string[];
  locations: unknown[];
  priority: number;
  isActive: boolean;
};

export async function listJobAxes(sql: SqlClient, userId: string) {
  return sql`
    SELECT
      id,
      title,
      description,
      contract_types AS "contractTypes",
      locations,
      priority,
      is_active AS "isActive",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM job_axes
    WHERE user_id = ${userId}
    ORDER BY is_active DESC, priority DESC, created_at DESC
  `;
}

export async function getJobAxis(sql: SqlClient, userId: string, id: string) {
  const rows = await sql<Array<JobAxisInput & { id: string }>>`
    SELECT
      id,
      title,
      description,
      contract_types AS "contractTypes",
      locations,
      priority,
      is_active AS "isActive"
    FROM job_axes
    WHERE id = ${id}
      AND user_id = ${userId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function createJobAxis(sql: SqlClient, userId: string, input: JobAxisInput) {
  const rows = await sql`
    INSERT INTO job_axes (
      user_id,
      title,
      description,
      contract_types,
      locations,
      priority,
      is_active
    )
    VALUES (
      ${userId},
      ${input.title},
      ${input.description},
      ARRAY(
        SELECT jsonb_array_elements_text(
          (${JSON.stringify(input.contractTypes)}::jsonb #>> '{}')::jsonb
        )
      ),
      (${JSON.stringify(input.locations)}::jsonb #>> '{}')::jsonb,
      ${input.priority},
      ${input.isActive}
    )
    RETURNING
      id,
      title,
      description,
      contract_types AS "contractTypes",
      locations,
      priority,
      is_active AS "isActive",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;

  return rows[0];
}

export async function updateJobAxis(
  sql: SqlClient,
  userId: string,
  id: string,
  input: JobAxisInput,
) {
  const rows = await sql`
    UPDATE job_axes
    SET
      title = ${input.title},
      description = ${input.description},
      contract_types = ARRAY(
        SELECT jsonb_array_elements_text(
          (${JSON.stringify(input.contractTypes)}::jsonb #>> '{}')::jsonb
        )
      ),
      locations = (${JSON.stringify(input.locations)}::jsonb #>> '{}')::jsonb,
      priority = ${input.priority},
      is_active = ${input.isActive},
      updated_at = now()
    WHERE id = ${id}
      AND user_id = ${userId}
    RETURNING
      id,
      title,
      description,
      contract_types AS "contractTypes",
      locations,
      priority,
      is_active AS "isActive",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;

  return rows[0] ?? null;
}

export async function deactivateJobAxis(sql: SqlClient, userId: string, id: string) {
  const rows = await sql`
    UPDATE job_axes
    SET is_active = false, updated_at = now()
    WHERE id = ${id}
      AND user_id = ${userId}
    RETURNING id
  `;

  return Boolean(rows[0]);
}
