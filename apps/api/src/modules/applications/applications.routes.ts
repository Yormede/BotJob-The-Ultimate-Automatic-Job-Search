import { getSql } from "../../shared/db";
import { badRequest, json, readJson, type HandlerContext } from "../../shared/http";
import { AuthRequiredError, requireSessionUser, unauthorized } from "../../shared/session";
import {
  createApplication,
  createApplicationEvent,
  deleteApplication,
  getApplication,
  listApplicationEvents,
  listApplications,
  updateApplication,
} from "./applications.repository";
import {
  normalizeApplicationInput,
  normalizeApplicationPatch,
  normalizeEventInput,
} from "./applications.service";

export async function listApplicationsController({ request }: HandlerContext) {
  return withApplicationRequest(request, async (sql, userId) => {
    const url = new URL(request.url);
    const rows = await listApplications(sql, userId, url.searchParams.get("query"));
    return json({ applications: rows });
  });
}

export async function createApplicationController({ request }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  return withApplicationRequest(request, async (sql, userId) => {
    const application = await createApplication(sql, userId, normalizeApplicationInput(body));
    return json({ application }, 201);
  });
}

export async function getApplicationController({ request, params }: HandlerContext) {
  return withApplicationRequest(request, async (sql, userId) => {
    const application = await getApplication(sql, userId, params.id);
    return application ? json({ application }) : json({ error: "candidature introuvable" }, 404);
  });
}

export async function updateApplicationController({ request, params }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  return withApplicationRequest(request, async (sql, userId) => {
    const current = await getApplication(sql, userId, params.id);
    if (!current) return json({ error: "candidature introuvable" }, 404);

    const application = await updateApplication(
      sql,
      userId,
      params.id,
      normalizeApplicationPatch(current, body),
    );
    return json({ application });
  });
}

export async function deleteApplicationController({ request, params }: HandlerContext) {
  return withApplicationRequest(request, async (sql, userId) => {
    const deleted = await deleteApplication(sql, userId, params.id);
    return deleted ? json({ ok: true }) : json({ error: "candidature introuvable" }, 404);
  });
}

export async function listApplicationEventsController({ request, params }: HandlerContext) {
  return withApplicationRequest(request, async (sql, userId) => {
    const events = await listApplicationEvents(sql, userId, params.id);
    return json({ events });
  });
}

export async function createApplicationEventController({ request, params }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  return withApplicationRequest(request, async (sql, userId) => {
    const event = await createApplicationEvent(sql, userId, params.id, normalizeEventInput(body));
    return event ? json({ event }, 201) : json({ error: "candidature introuvable" }, 404);
  });
}

async function withApplicationRequest(
  request: Request,
  callback: (sql: ReturnType<typeof getSql>, userId: string) => Promise<Response>,
) {
  const sql = getSql();
  try {
    const user = await requireSessionUser(sql, request);
    return await callback(sql, user.id);
  } catch (error) {
    if (error instanceof AuthRequiredError) return unauthorized();
    return badRequest(error instanceof Error ? error.message : "requete invalide");
  } finally {
    await sql.close();
  }
}
