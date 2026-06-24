import { getSessionUser } from "../modules/auth/auth.service";
import { cookieValue, json, type SessionUser } from "./http";
import type { SqlClient } from "../modules/auth/auth.repository";

export async function requireSessionUser(sql: SqlClient, request: Request): Promise<SessionUser> {
  const user = await getSessionUser(sql, cookieValue(request, "botjob_session"));
  if (!user) {
    throw new AuthRequiredError();
  }

  return user;
}

export class AuthRequiredError extends Error {
  constructor() {
    super("authentification requise");
  }
}

export function unauthorized() {
  return json({ error: "authentification requise" }, 401);
}
