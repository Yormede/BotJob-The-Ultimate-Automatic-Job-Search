import { getSql } from "../../shared/db";
import { badRequest, json, type HandlerContext } from "../../shared/http";
import { AuthRequiredError, requireSessionUser, unauthorized } from "../../shared/session";
import { getDashboard } from "./dashboard.repository";

export async function dashboardController({ request }: HandlerContext) {
  const sql = getSql();
  try {
    const user = await requireSessionUser(sql, request);
    const dashboard = await getDashboard(sql, user.id);
    return json({ dashboard });
  } catch (error) {
    if (error instanceof AuthRequiredError) return unauthorized();
    return badRequest(error instanceof Error ? error.message : "dashboard indisponible");
  } finally {
    await sql.close();
  }
}
