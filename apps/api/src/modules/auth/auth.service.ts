import { createHash, randomBytes, randomInt } from "node:crypto";
import type { SessionUser } from "../../shared/http";
import {
  activateUserEmail,
  consumeAuthCode,
  createAuthCode,
  createSession,
  createUser,
  findActiveAuthCode,
  findUserBySessionToken,
  findUserForLogin,
  findUserForVerification,
  revokeSession,
  type SqlClient,
} from "./auth.repository";

const SESSION_DAYS = 14;
const VERIFICATION_CODE_MINUTES = 20;
export const SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 24 * 60 * 60;

export type AuthResult = {
  user: SessionUser;
  token: string;
};

export type RegisterResult = {
  user: SessionUser;
  verificationCode?: string;
};

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashAuthCode(code: string) {
  return hashToken(code.trim());
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

function newVerificationCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function exposeDevCode(code: string) {
  return process.env.NODE_ENV === "production" ? undefined : code;
}

export async function register(sql: SqlClient, body: Record<string, unknown>): Promise<RegisterResult> {
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

  const verificationCode = newVerificationCode();
  await createAuthCode(
    sql,
    user.id,
    "email_verification",
    hashAuthCode(verificationCode),
    new Date(Date.now() + VERIFICATION_CODE_MINUTES * 60 * 1000),
  );

  return { user, verificationCode: exposeDevCode(verificationCode) };
}

export async function login(sql: SqlClient, body: Record<string, unknown>): Promise<AuthResult> {
  const loginValue = requireText(body.login, "identifiant");
  const password = requireText(body.password, "mot de passe");
  const user = await findUserForLogin(sql, loginValue);

  if (!user?.passwordHash || !(await Bun.password.verify(password, user.passwordHash))) {
    throw new Error("identifiants invalides");
  }

  if (user.status !== "active") {
    throw new Error("email non verifie");
  }

  const { passwordHash: _passwordHash, status: _status, ...safeUser } = user;
  return createUserSession(sql, safeUser, String(body.userAgent || ""));
}

export async function verifyEmail(sql: SqlClient, body: Record<string, unknown>): Promise<AuthResult> {
  const email = normalizeEmail(requireText(body.email, "email"));
  const code = requireText(body.code, "code");
  const user = await findUserForVerification(sql, email);

  if (!user) throw new Error("code invalide");
  if (user.status === "active") return createUserSession(sql, user, String(body.userAgent || ""));

  const authCode = await findActiveAuthCode(sql, user.id, "email_verification");
  if (!authCode || authCode.codeHash !== hashAuthCode(code)) {
    throw new Error("code invalide ou expire");
  }

  await consumeAuthCode(sql, authCode.id);
  const activeUser = await activateUserEmail(sql, user.id);
  return createUserSession(sql, activeUser, String(body.userAgent || ""));
}

export async function resendVerificationCode(sql: SqlClient, body: Record<string, unknown>) {
  const email = normalizeEmail(requireText(body.email, "email"));
  const user = await findUserForVerification(sql, email);
  if (!user) throw new Error("compte introuvable");
  if (user.status === "active") return { alreadyVerified: true, verificationCode: undefined };

  const verificationCode = newVerificationCode();
  await createAuthCode(
    sql,
    user.id,
    "email_verification",
    hashAuthCode(verificationCode),
    new Date(Date.now() + VERIFICATION_CODE_MINUTES * 60 * 1000),
  );

  return { alreadyVerified: false, verificationCode: exposeDevCode(verificationCode) };
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
