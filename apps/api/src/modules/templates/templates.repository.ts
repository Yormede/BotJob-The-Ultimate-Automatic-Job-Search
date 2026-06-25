import type { SqlClient } from "../auth/auth.repository";

export type TemplateKind = "cv" | "cover_letter";

export type TemplateInput = {
  kind: TemplateKind;
  name: string;
  description: string;
  htmlContent: string | null;
  cssContent: string | null;
  isAtsOneColumn: boolean;
  isDefault: boolean;
};

export async function listTemplates(sql: SqlClient, userId: string) {
  return sql`
    SELECT
      id,
      kind,
      name,
      description,
      html_content AS "htmlContent",
      css_content AS "cssContent",
      is_ats_one_column AS "isAtsOneColumn",
      is_default AS "isDefault",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM templates
    WHERE user_id = ${userId}
      AND deleted_at IS NULL
    ORDER BY kind, is_default DESC, updated_at DESC
  `;
}

export async function getTemplate(sql: SqlClient, userId: string, id: string) {
  const rows = await sql<Array<TemplateInput & { id: string }>>`
    SELECT
      id,
      kind,
      name,
      description,
      html_content AS "htmlContent",
      css_content AS "cssContent",
      is_ats_one_column AS "isAtsOneColumn",
      is_default AS "isDefault"
    FROM templates
    WHERE id = ${id}
      AND user_id = ${userId}
      AND deleted_at IS NULL
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function createTemplate(sql: SqlClient, userId: string, input: TemplateInput) {
  if (input.isDefault) await clearDefaultTemplate(sql, userId, input.kind);

  const rows = await sql`
    INSERT INTO templates (
      user_id,
      kind,
      name,
      description,
      html_content,
      css_content,
      is_ats_one_column,
      is_default
    )
    VALUES (
      ${userId},
      ${input.kind},
      ${input.name},
      ${input.description},
      ${input.htmlContent},
      ${input.cssContent},
      ${input.isAtsOneColumn},
      ${input.isDefault}
    )
    RETURNING
      id,
      kind,
      name,
      description,
      html_content AS "htmlContent",
      css_content AS "cssContent",
      is_ats_one_column AS "isAtsOneColumn",
      is_default AS "isDefault",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;

  return rows[0];
}

export async function updateTemplate(
  sql: SqlClient,
  userId: string,
  id: string,
  input: TemplateInput,
) {
  if (input.isDefault) await clearDefaultTemplate(sql, userId, input.kind);

  const rows = await sql`
    UPDATE templates
    SET
      kind = ${input.kind},
      name = ${input.name},
      description = ${input.description},
      html_content = ${input.htmlContent},
      css_content = ${input.cssContent},
      is_ats_one_column = ${input.isAtsOneColumn},
      is_default = ${input.isDefault},
      updated_at = now()
    WHERE id = ${id}
      AND user_id = ${userId}
      AND deleted_at IS NULL
    RETURNING
      id,
      kind,
      name,
      description,
      html_content AS "htmlContent",
      css_content AS "cssContent",
      is_ats_one_column AS "isAtsOneColumn",
      is_default AS "isDefault",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;

  return rows[0] ?? null;
}

export async function deleteTemplate(sql: SqlClient, userId: string, id: string) {
  const rows = await sql`
    UPDATE templates
    SET deleted_at = now(),
        is_default = false,
        updated_at = now()
    WHERE id = ${id}
      AND user_id = ${userId}
      AND deleted_at IS NULL
    RETURNING id
  `;

  return Boolean(rows[0]);
}

export async function userOwnsTemplate(
  sql: SqlClient,
  userId: string,
  id: string | null,
  kind: TemplateKind,
) {
  if (!id) return true;

  const rows = await sql<{ id: string }[]>`
    SELECT id
    FROM templates
    WHERE id = ${id}
      AND user_id = ${userId}
      AND kind = ${kind}
      AND deleted_at IS NULL
    LIMIT 1
  `;

  return Boolean(rows[0]);
}

async function clearDefaultTemplate(
  sql: SqlClient,
  userId: string,
  kind: TemplateKind,
) {
  await sql`
    UPDATE templates
    SET is_default = false,
        updated_at = now()
    WHERE user_id = ${userId}
      AND kind = ${kind}
      AND deleted_at IS NULL
  `;
}
