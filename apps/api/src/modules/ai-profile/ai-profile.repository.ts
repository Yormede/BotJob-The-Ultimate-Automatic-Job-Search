import type { SqlClient } from "../auth/auth.repository";

export type AiProfileInput = {
  sections: Record<string, unknown>;
  customInstructions: string;
  lifeTrace: unknown[];
};

export async function getAiProfile(sql: SqlClient, userId: string) {
  const rows = await sql`
    SELECT
      user_id AS "userId",
      sections,
      custom_instructions AS "customInstructions",
      life_trace AS "lifeTrace",
      updated_at AS "updatedAt"
    FROM ai_profiles
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function upsertAiProfile(sql: SqlClient, userId: string, input: AiProfileInput) {
  const rows = await sql`
    INSERT INTO ai_profiles (user_id, sections, custom_instructions, life_trace, updated_at)
    VALUES (
      ${userId},
      (${JSON.stringify(input.sections)}::jsonb #>> '{}')::jsonb,
      ${input.customInstructions},
      (${JSON.stringify(input.lifeTrace)}::jsonb #>> '{}')::jsonb,
      now()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      sections = EXCLUDED.sections,
      custom_instructions = EXCLUDED.custom_instructions,
      life_trace = EXCLUDED.life_trace,
      updated_at = now()
    RETURNING
      user_id AS "userId",
      sections,
      custom_instructions AS "customInstructions",
      life_trace AS "lifeTrace",
      updated_at AS "updatedAt"
  `;

  return rows[0];
}
