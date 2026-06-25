import type { SqlClient } from "../auth/auth.repository";

export type ApplicationForGeneration = {
  id: string;
  company: string;
  jobTitle: string;
  fullOfferText: string;
  userFirstName: string;
  userLastName: string;
};

export type GeneratedDocumentInput = {
  kind: "cv" | "cover_letter" | "approach_message";
  templateId: string | null;
  title: string;
  contentText: string;
  htmlContent: string | null;
  cssContent: string | null;
  isAtsOneColumn: boolean;
};

export async function getApplicationForGeneration(
  sql: SqlClient,
  userId: string,
  applicationId: string,
) {
  const rows = await sql<ApplicationForGeneration[]>`
    SELECT
      a.id,
      a.company,
      a.job_title AS "jobTitle",
      a.full_offer_text AS "fullOfferText",
      u.first_name AS "userFirstName",
      u.last_name AS "userLastName"
    FROM applications a
    JOIN users u ON u.id = a.user_id
    WHERE a.id = ${applicationId}
      AND a.user_id = ${userId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function listGeneratedDocuments(sql: SqlClient, userId: string, applicationId: string) {
  return sql`
    SELECT
      d.id,
      d.application_id AS "applicationId",
      d.generation_run_id AS "generationRunId",
      d.template_id AS "templateId",
      d.kind,
      d.version,
      d.title,
      d.content_text AS "contentText",
      d.html_content AS "htmlContent",
      d.css_content AS "cssContent",
      d.is_ats_one_column AS "isAtsOneColumn",
      d.generated_at AS "generatedAt"
    FROM generated_documents d
    JOIN applications a ON a.id = d.application_id
    WHERE d.user_id = ${userId}
      AND d.application_id = ${applicationId}
      AND a.user_id = ${userId}
    ORDER BY d.generated_at DESC
  `;
}

export async function createGenerationRun(
  sql: SqlClient,
  userId: string,
  applicationId: string,
  input: {
    includeCv: boolean;
    includeCoverLetter: boolean;
    includeApproachMessage: boolean;
  },
) {
  const rows = await sql<{ id: string }[]>`
    INSERT INTO generation_runs (
      user_id,
      application_id,
      status,
      include_cv,
      include_cover_letter,
      include_approach_message,
      started_at,
      finished_at
    )
    VALUES (
      ${userId},
      ${applicationId},
      'completed',
      ${input.includeCv},
      ${input.includeCoverLetter},
      ${input.includeApproachMessage},
      now(),
      now()
    )
    RETURNING id
  `;

  return rows[0];
}

export async function createGeneratedDocument(
  sql: SqlClient,
  userId: string,
  applicationId: string,
  generationRunId: string,
  input: GeneratedDocumentInput,
) {
  const rows = await sql`
    WITH next_version AS (
      SELECT COALESCE(max(version), 0) + 1 AS version
      FROM generated_documents
      WHERE application_id = ${applicationId}
        AND kind = ${input.kind}
    )
    INSERT INTO generated_documents (
      user_id,
      application_id,
      generation_run_id,
      template_id,
      kind,
      version,
      title,
      content_text,
      html_content,
      css_content,
      is_ats_one_column
    )
    SELECT
      ${userId},
      ${applicationId},
      ${generationRunId},
      ${input.templateId},
      ${input.kind},
      next_version.version,
      ${input.title},
      ${input.contentText},
      ${input.htmlContent},
      ${input.cssContent},
      ${input.isAtsOneColumn}
    FROM next_version
    RETURNING
      id,
      application_id AS "applicationId",
      generation_run_id AS "generationRunId",
      template_id AS "templateId",
      kind,
      version,
      title,
      content_text AS "contentText",
      html_content AS "htmlContent",
      css_content AS "cssContent",
      is_ats_one_column AS "isAtsOneColumn",
      generated_at AS "generatedAt"
  `;

  return rows[0];
}
