import { createHash, randomBytes } from "node:crypto";
import type { SessionUser } from "../../shared/http";
import {
  createSession,
  createUser,
  findUserBySessionToken,
  findUserForLogin,
  revokeSession,
  type SqlClient,
} from "./auth.repository";

const SESSION_DAYS = 14;
export const SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 24 * 60 * 60;

export type AuthResult = {
  user: SessionUser;
  token: string;
};

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function requireText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} est requis`);
  }

  return value.trim();
}

function newSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function register(sql: SqlClient, body: Record<string, unknown>): Promise<AuthResult> {
  const email = normalizeEmail(requireText(body.email, "email"));
  const username = requireText(body.username, "username");
  const password = requireText(body.password, "mot de passe");
  const firstName = requireText(body.firstName, "prenom");
  const lastName = requireText(body.lastName, "nom");

  if (!email.includes("@")) throw new Error("email invalide");
  if (password.length < 8) throw new Error("mot de passe trop court");

  const user = await createUser(sql, {
    email,
    username,
    passwordHash: await Bun.password.hash(password),
    firstName,
    lastName,
    phoneCountryCode: String(body.phoneCountryCode || "+33"),
    phoneNumber: String(body.phoneNumber || "0000000000"),
    avatarId: String(body.avatarId || "pro-slate-01"),
  });

  return createUserSession(sql, user, String(body.userAgent || ""));
}

export async function login(sql: SqlClient, body: Record<string, unknown>): Promise<AuthResult> {
  const loginValue = requireText(body.login, "identifiant");
  const password = requireText(body.password, "mot de passe");
  const user = await findUserForLogin(sql, loginValue);

  if (!user?.passwordHash || !(await Bun.password.verify(password, user.passwordHash))) {
    throw new Error("identifiants invalides");
  }

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return createUserSession(sql, safeUser, String(body.userAgent || ""));
}

export async function getSessionUser(sql: SqlClient, token: string | undefined) {
  if (!token) return null;
  return findUserBySessionToken(sql, hashToken(token));
}

export async function logout(sql: SqlClient, token: string | undefined) {
  if (token) await revokeSession(sql, hashToken(token));
}

async function createUserSession(
  sql: SqlClient,
  user: SessionUser,
  userAgent: string | null,
): Promise<AuthResult> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  await createSession(sql, user.id, hashToken(token), expiresAt, userAgent);
  return { user, token };
}
