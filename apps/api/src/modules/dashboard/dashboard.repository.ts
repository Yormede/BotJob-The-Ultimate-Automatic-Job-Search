import type { SqlClient } from "../auth/auth.repository";

export async function getDashboard(sql: SqlClient, userId: string) {
  const stats = await sql`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE status = 'draft')::int AS draft,
      count(*) FILTER (WHERE status = 'sent')::int AS sent,
      count(*) FILTER (WHERE status = 'follow_up')::int AS "followUp",
      count(*) FILTER (WHERE status = 'interview')::int AS interview,
      count(*) FILTER (WHERE status = 'accepted')::int AS accepted,
      count(*) FILTER (WHERE status = 'rejected')::int AS rejected,
      count(*) FILTER (WHERE status = 'archived')::int AS archived
    FROM applications
    WHERE user_id = ${userId}
  `;

  const recentApplications = await sql`
    SELECT
      id,
      company,
      job_title AS "jobTitle",
      status,
      applied_at AS "appliedAt",
      created_at AS "createdAt"
    FROM applications
    WHERE user_id = ${userId}
    ORDER BY applied_at DESC NULLS LAST, created_at DESC
    LIMIT 5
  `;

  const nextActions = await sql`
    SELECT
      e.id,
      e.application_id AS "applicationId",
      a.company,
      a.job_title AS "jobTitle",
      e.label,
      e.event_at AS "eventAt",
      e.created_at AS "createdAt"
    FROM application_events e
    JOIN applications a ON a.id = e.application_id
    WHERE a.user_id = ${userId}
      AND e.event_type = 'next_action'
      AND e.state IN ('active', 'suggested')
    ORDER BY e.event_at ASC NULLS LAST, e.created_at DESC
    LIMIT 5
  `;

  return {
    stats: stats[0],
    recentApplications,
    nextActions,
  };
}
