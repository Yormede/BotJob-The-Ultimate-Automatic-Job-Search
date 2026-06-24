import { getSql } from "../../shared/db";
import { badRequest, json, readJson, type HandlerContext } from "../../shared/http";
import { AuthRequiredError, requireSessionUser, unauthorized } from "../../shared/session";
import {
  createJobAxis,
  deactivateJobAxis,
  getJobAxis,
  listJobAxes,
  updateJobAxis,
} from "./job-axes.repository";
import { normalizeJobAxisInput, normalizeJobAxisPatch } from "./job-axes.service";

export async function listJobAxesController({ request }: HandlerContext) {
  return withJobAxisRequest(request, async (sql, userId) => {
    const jobAxes = await listJobAxes(sql, userId);
    return json({ jobAxes });
  });
}

export async function createJobAxisController({ request }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  return withJobAxisRequest(request, async (sql, userId) => {
    const jobAxis = await createJobAxis(sql, userId, normalizeJobAxisInput(body));
    return json({ jobAxis }, 201);
  });
}

export async function updateJobAxisController({ request, params }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  return withJobAxisRequest(request, async (sql, userId) => {
    const current = await getJobAxis(sql, userId, params.id);
    if (!current) return json({ error: "axe introuvable" }, 404);

    const jobAxis = await updateJobAxis(
      sql,
      userId,
      params.id,
      normalizeJobAxisPatch(current, body),
    );
    return json({ jobAxis });
  });
}

export async function deactivateJobAxisController({ request, params }: HandlerContext) {
  return withJobAxisRequest(request, async (sql, userId) => {
    const deactivated = await deactivateJobAxis(sql, userId, params.id);
    return deactivated ? json({ ok: true }) : json({ error: "axe introuvable" }, 404);
  });
}

async function withJobAxisRequest(
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
