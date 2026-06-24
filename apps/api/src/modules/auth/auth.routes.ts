import { getSql } from "../../shared/db";
import {
  badRequest,
  clearSessionCookie,
  cookieValue,
  json,
  readJson,
  sessionCookie,
} from "../../shared/http";
import {
  getSessionUser,
  login,
  logout,
  register,
  SESSION_MAX_AGE_SECONDS,
} from "./auth.service";

export async function registerController(request: Request) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  const sql = getSql();
  try {
    const result = await register(sql, {
      ...body,
      userAgent: request.headers.get("user-agent") ?? "",
    });

    return json({ user: result.user }, 201, {
      "Set-Cookie": sessionCookie(result.token, SESSION_MAX_AGE_SECONDS),
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "inscription impossible");
  } finally {
    await sql.close();
  }
}

export async function loginController(request: Request) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  const sql = getSql();
  try {
    const result = await login(sql, {
      ...body,
      userAgent: request.headers.get("user-agent") ?? "",
    });

    return json({ user: result.user }, 200, {
      "Set-Cookie": sessionCookie(result.token, SESSION_MAX_AGE_SECONDS),
    });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "connexion impossible");
  } finally {
    await sql.close();
  }
}

export async function sessionController(request: Request) {
  const sql = getSql();
  try {
    const user = await getSessionUser(sql, cookieValue(request, "botjob_session"));
    return json({ user });
  } finally {
    await sql.close();
  }
}

export async function logoutController(request: Request) {
  const sql = getSql();
  try {
    await logout(sql, cookieValue(request, "botjob_session"));
    return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookie() });
  } finally {
    await sql.close();
  }
}
