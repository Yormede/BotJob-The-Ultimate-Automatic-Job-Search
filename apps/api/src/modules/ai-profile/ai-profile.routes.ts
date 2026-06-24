import { getSql } from "../../shared/db";
import { badRequest, json, readJson, type HandlerContext } from "../../shared/http";
import { AuthRequiredError, requireSessionUser, unauthorized } from "../../shared/session";
import { getAiProfile, upsertAiProfile } from "./ai-profile.repository";
import { normalizeAiProfileInput } from "./ai-profile.service";

export async function getAiProfileController({ request }: HandlerContext) {
  return withAiProfileRequest(request, async (sql, userId) => {
    const profile = await getAiProfile(sql, userId);
    return json({ profile });
  });
}

export async function upsertAiProfileController({ request }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  return withAiProfileRequest(request, async (sql, userId) => {
    const profile = await upsertAiProfile(sql, userId, normalizeAiProfileInput(body));
    return json({ profile });
  });
}

async function withAiProfileRequest(
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
