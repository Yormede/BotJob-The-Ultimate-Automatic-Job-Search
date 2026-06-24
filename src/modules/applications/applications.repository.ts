export type SqlClient = <T = unknown>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T[]>;

export type ApplicationListRow = {
  id: string;
  company: string;
  jobTitle: string;
  locationLabel: string | null;
  appliedAt: string | null;
  lastAction: string | null;
  nextAction: string | null;
};

export type CreateApplicationInput = {
  userId: string;
  jobAxisId?: string | null;
  company: string;
  jobTitle: string;
  offerUrl?: string | null;
  fullOfferText: string;
  locationLabel?: string | null;
  contractType?: string | null;
  searchText: string;
};

export async function searchApplications(
  sql: SqlClient,
  userId: string,
  query: string,
  limit = 20,
) {
  return sql<ApplicationListRow>`
    SELECT
      a.id,
      a.company,
      a.job_title AS "jobTitle",
      a.location_label AS "locationLabel",
      a.applied_at AS "appliedAt",
      last_event.label AS "lastAction",
      next_event.label AS "nextAction"
    FROM applications a
    LEFT JOIN LATERAL (
      SELECT label
      FROM application_events e
      WHERE e.application_id = a.id
        AND e.event_type = 'last_action'
      ORDER BY e.created_at DESC
      LIMIT 1
    ) last_event ON true
    LEFT JOIN LATERAL (
      SELECT label
      FROM application_events e
      WHERE e.application_id = a.id
        AND e.event_type = 'next_action'
        AND e.state = 'suggested'
      ORDER BY e.created_at DESC
      LIMIT 1
    ) next_event ON true
    WHERE a.user_id = ${userId}
      AND (
        ${query} = ''
        OR a.search_vector @@ plainto_tsquery('french', ${query})
      )
    ORDER BY a.applied_at DESC NULLS LAST, a.created_at DESC
    LIMIT ${limit}
  `;
}

export async function getApplicationByIdForUser(
  sql: SqlClient,
  userId: string,
  applicationId: string,
) {
  const rows = await sql`
    SELECT *
    FROM applications
    WHERE id = ${applicationId}
      AND user_id = ${userId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function createApplication(sql: SqlClient, input: CreateApplicationInput) {
  const rows = await sql<{ id: string }>`
    INSERT INTO applications (
      user_id,
      job_axis_id,
      company,
      job_title,
      offer_url,
      full_offer_text,
      location_label,
      contract_type,
      search_text
    )
    VALUES (
      ${input.userId},
      ${input.jobAxisId ?? null},
      ${input.company},
      ${input.jobTitle},
      ${input.offerUrl ?? null},
      ${input.fullOfferText},
      ${input.locationLabel ?? null},
      ${input.contractType ?? null},
      ${input.searchText}
    )
    RETURNING id
  `;

  return rows[0];
}
