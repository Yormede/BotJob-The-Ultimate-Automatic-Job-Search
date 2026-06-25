import { getSql } from "../../shared/db";
import { badRequest, json, readJson, type HandlerContext } from "../../shared/http";
import { AuthRequiredError, requireSessionUser, unauthorized } from "../../shared/session";
import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
} from "./templates.repository";
import { normalizeTemplateInput, normalizeTemplatePatch } from "./templates.service";

export async function listTemplatesController({ request }: HandlerContext) {
  return withTemplateRequest(request, async (sql, userId) => {
    const templates = await listTemplates(sql, userId);
    return json({ templates });
  });
}

export async function createTemplateController({ request }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  return withTemplateRequest(request, async (sql, userId) => {
    const template = await createTemplate(sql, userId, normalizeTemplateInput(body));
    return json({ template }, 201);
  });
}

export async function updateTemplateController({ request, params }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  return withTemplateRequest(request, async (sql, userId) => {
    const current = await getTemplate(sql, userId, params.id);
    if (!current) return json({ error: "template introuvable" }, 404);

    const template = await updateTemplate(
      sql,
      userId,
      params.id,
      normalizeTemplatePatch(current, body),
    );
    return json({ template });
  });
}

export async function deleteTemplateController({ request, params }: HandlerContext) {
  return withTemplateRequest(request, async (sql, userId) => {
    const deleted = await deleteTemplate(sql, userId, params.id);
    return deleted ? json({ ok: true }) : json({ error: "template introuvable" }, 404);
  });
}

async function withTemplateRequest(
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
