import type { SessionUser } from "../../shared/http";

export type SqlClient = ReturnType<typeof Bun.SQL>;

export type RegisterUserInput = {
  email: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  avatarId: string;
};

export async function createUser(sql: SqlClient, input: RegisterUserInput) {
  const rows = await sql<SessionUser[]>`
    INSERT INTO users (
      email,
      username,
      password_hash,
      first_name,
      last_name,
      phone_country_code,
      phone_number,
      avatar_id,
      status
    )
    VALUES (
      ${input.email},
      ${input.username},
      ${input.passwordHash},
      ${input.firstName},
      ${input.lastName},
      ${input.phoneCountryCode},
      ${input.phoneNumber},
      ${input.avatarId},
      'active'
    )
    RETURNING
      id,
      email,
      username,
      first_name AS "firstName",
      last_name AS "lastName"
  `;

  await sql`INSERT INTO ai_profiles (user_id) VALUES (${rows[0].id})`;
  return rows[0];
}

export async function findUserForLogin(sql: SqlClient, login: string) {
  const rows = await sql<Array<SessionUser & { passwordHash: string }>>`
    SELECT
      id,
      email,
      username,
      first_name AS "firstName",
      last_name AS "lastName",
      password_hash AS "passwordHash"
    FROM users
    WHERE lower(email) = lower(${login})
       OR lower(username) = lower(${login})
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function createSession(
  sql: SqlClient,
  userId: string,
  tokenHash: string,
  expiresAt: Date,
  userAgent: string | null,
) {
  await sql`
    INSERT INTO user_sessions (user_id, session_token_hash, expires_at, user_agent)
    VALUES (${userId}, ${tokenHash}, ${expiresAt}, ${userAgent})
  `;
}

export async function findUserBySessionToken(sql: SqlClient, tokenHash: string) {
  const rows = await sql<SessionUser[]>`
    SELECT
      u.id,
      u.email,
      u.username,
      u.first_name AS "firstName",
      u.last_name AS "lastName"
    FROM user_sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token_hash = ${tokenHash}
      AND s.revoked_at IS NULL
      AND s.expires_at > now()
      AND u.status = 'active'
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function revokeSession(sql: SqlClient, tokenHash: string) {
  await sql`
    UPDATE user_sessions
    SET revoked_at = now()
    WHERE session_token_hash = ${tokenHash}
  `;
}
