import type { SqlClient } from "../auth/auth.repository";

export type ApplicationStatus =
  | "draft"
  | "sent"
  | "follow_up"
  | "interview"
  | "accepted"
  | "rejected"
  | "archived";

export type ApplicationInput = {
  jobAxisId: string | null;
  company: string;
  jobTitle: string;
  offerUrl: string | null;
  fullOfferText: string;
  locationLabel: string | null;
  contractType: string | null;
  status: ApplicationStatus;
  appliedAt: Date | null;
  searchText: string;
};

export type ApplicationPatchInput = Partial<ApplicationInput>;

export type ApplicationEventInput = {
  eventType: string;
  label: string;
  state: string;
  author: string;
  eventAt: Date | null;
};

export type ApplicationRow = ApplicationInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export async function listApplications(sql: SqlClient, userId: string, query: string | null) {
  const normalizedQuery = query?.trim() || null;

  return sql`
    SELECT
      a.id,
      a.job_axis_id AS "jobAxisId",
      a.company,
      a.job_title AS "jobTitle",
      a.offer_url AS "offerUrl",
      a.full_offer_text AS "fullOfferText",
      a.location_label AS "locationLabel",
      a.contract_type AS "contractType",
      a.status,
      a.applied_at AS "appliedAt",
      a.search_text AS "searchText",
      a.created_at AS "createdAt",
      a.updated_at AS "updatedAt",
      last_event.label AS "lastAction",
      next_event.label AS "nextAction"
    FROM applications a
    LEFT JOIN LATERAL (
      SELECT label
      FROM application_events e
      WHERE e.application_id = a.id
        AND e.event_type IN ('last_action', 'status_change', 'note')
      ORDER BY e.created_at DESC
      LIMIT 1
    ) last_event ON true
    LEFT JOIN LATERAL (
      SELECT label
      FROM application_events e
      WHERE e.application_id = a.id
        AND e.event_type = 'next_action'
        AND e.state IN ('active', 'suggested')
      ORDER BY e.created_at DESC
      LIMIT 1
    ) next_event ON true
    WHERE a.user_id = ${userId}
      AND (${normalizedQuery}::text IS NULL OR a.search_vector @@ plainto_tsquery('french', ${normalizedQuery}))
    ORDER BY a.applied_at DESC NULLS LAST, a.created_at DESC
  `;
}

export async function getApplication(sql: SqlClient, userId: string, id: string) {
  const rows = await sql<ApplicationRow[]>`
    SELECT
      id,
      job_axis_id AS "jobAxisId",
      company,
      job_title AS "jobTitle",
      offer_url AS "offerUrl",
      full_offer_text AS "fullOfferText",
      location_label AS "locationLabel",
      contract_type AS "contractType",
      status,
      applied_at AS "appliedAt",
      search_text AS "searchText",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM applications
    WHERE id = ${id}
      AND user_id = ${userId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function createApplication(sql: SqlClient, userId: string, input: ApplicationInput) {
  const rows = await sql`
    INSERT INTO applications (
      user_id,
      job_axis_id,
      company,
      job_title,
      offer_url,
      full_offer_text,
      location_label,
      contract_type,
      status,
      applied_at,
      search_text
    )
    VALUES (
      ${userId},
      ${input.jobAxisId},
      ${input.company},
      ${input.jobTitle},
      ${input.offerUrl},
      ${input.fullOfferText},
      ${input.locationLabel},
      ${input.contractType},
      ${input.status},
      ${input.appliedAt},
      ${input.searchText}
    )
    RETURNING
      id,
      job_axis_id AS "jobAxisId",
      company,
      job_title AS "jobTitle",
      offer_url AS "offerUrl",
      full_offer_text AS "fullOfferText",
      location_label AS "locationLabel",
      contract_type AS "contractType",
      status,
      applied_at AS "appliedAt",
      search_text AS "searchText",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;

  return rows[0];
}

export async function updateApplication(
  sql: SqlClient,
  userId: string,
  id: string,
  input: ApplicationInput,
) {
  const rows = await sql`
    UPDATE applications
    SET
      job_axis_id = ${input.jobAxisId},
      company = ${input.company},
      job_title = ${input.jobTitle},
      offer_url = ${input.offerUrl},
      full_offer_text = ${input.fullOfferText},
      location_label = ${input.locationLabel},
      contract_type = ${input.contractType},
      status = ${input.status},
      applied_at = ${input.appliedAt},
      search_text = ${input.searchText},
      updated_at = now()
    WHERE id = ${id}
      AND user_id = ${userId}
    RETURNING
      id,
      job_axis_id AS "jobAxisId",
      company,
      job_title AS "jobTitle",
      offer_url AS "offerUrl",
      full_offer_text AS "fullOfferText",
      location_label AS "locationLabel",
      contract_type AS "contractType",
      status,
      applied_at AS "appliedAt",
      search_text AS "searchText",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;

  return rows[0] ?? null;
}

export async function deleteApplication(sql: SqlClient, userId: string, id: string) {
  const rows = await sql`
    DELETE FROM applications
    WHERE id = ${id}
      AND user_id = ${userId}
    RETURNING id
  `;

  return Boolean(rows[0]);
}

export async function listApplicationEvents(sql: SqlClient, userId: string, applicationId: string) {
  return sql`
    SELECT
      e.id,
      e.application_id AS "applicationId",
      e.event_type AS "eventType",
      e.label,
      e.state,
      e.author,
      e.event_at AS "eventAt",
      e.created_at AS "createdAt"
    FROM application_events e
    JOIN applications a ON a.id = e.application_id
    WHERE e.application_id = ${applicationId}
      AND a.user_id = ${userId}
    ORDER BY e.created_at DESC
  `;
}

export async function createApplicationEvent(
  sql: SqlClient,
  userId: string,
  applicationId: string,
  input: ApplicationEventInput,
) {
  const rows = await sql`
    INSERT INTO application_events (application_id, event_type, label, state, author, event_at)
    SELECT ${applicationId}, ${input.eventType}, ${input.label}, ${input.state}, ${input.author}, ${input.eventAt}
    FROM applications a
    WHERE a.id = ${applicationId}
      AND a.user_id = ${userId}
    RETURNING
      id,
      application_id AS "applicationId",
      event_type AS "eventType",
      label,
      state,
      author,
      event_at AS "eventAt",
      created_at AS "createdAt"
  `;

  return rows[0] ?? null;
}
