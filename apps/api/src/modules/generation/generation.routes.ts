import { getSql } from "../../shared/db";
import { badRequest, json, readJson, type HandlerContext } from "../../shared/http";
import { AuthRequiredError, requireSessionUser, unauthorized } from "../../shared/session";
import { userOwnsTemplate } from "../templates/templates.repository";
import {
  createGeneratedDocument,
  createGenerationRun,
  getApplicationForGeneration,
  listGeneratedDocuments,
} from "./generation.repository";
import { buildGeneratedDocuments, normalizeGenerationInput } from "./generation.service";

export async function listGeneratedDocumentsController({ request, params }: HandlerContext) {
  return withGenerationRequest(request, async (sql, userId) => {
    const documents = await listGeneratedDocuments(sql, userId, params.id);
    return json({ documents });
  });
}

export async function generateDocumentsController({ request, params }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);

  return withGenerationRequest(request, async (sql, userId) => {
    const application = await getApplicationForGeneration(sql, userId, params.id);
    if (!application) return json({ error: "candidature introuvable" }, 404);

    const input = normalizeGenerationInput(body);
    if (!(await userOwnsTemplate(sql, userId, input.cvTemplateId, "cv"))) {
      return json({ error: "template CV introuvable" }, 404);
    }
    if (!(await userOwnsTemplate(sql, userId, input.coverLetterTemplateId, "cover_letter"))) {
      return json({ error: "template lettre introuvable" }, 404);
    }

    const run = await createGenerationRun(sql, userId, params.id, input);
    const documents = [];

    for (const documentInput of buildGeneratedDocuments(application, input)) {
      documents.push(await createGeneratedDocument(sql, userId, params.id, run.id, documentInput));
    }

    return json({ run, documents }, 201);
  });
}

async function withGenerationRequest(
  request: Request,
  callback: (sql: ReturnType<typeof getSql>, userId: string) => Promise<Response>,
) {
  const sql = getSql();
  try {
    const user = await requireSessionUser(sql, request);
    return await callback(sql, user.id);
  } catch (error) {
    if (error instanceof AuthRequiredError) return unauthorized();
    return badRequest(error instanceof Error ? error.message : "generation impossible");
  } finally {
    await sql.close();
  }
}
