export type SessionUser = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
};

export type HandlerContext = {
  request: Request;
  params: Record<string, string>;
};

export type Handler = (context: HandlerContext) => Promise<Response> | Response;

export function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return Response.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": process.env.WEB_ORIGIN ?? "http://127.0.0.1:5173",
      "Access-Control-Allow-Credentials": "true",
      ...headers,
    },
  });
}

export async function readJson<T>(request: Request) {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function badRequest(message: string) {
  return json({ error: message }, 400);
}

export function cookieValue(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function sessionCookie(token: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `botjob_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function clearSessionCookie() {
  return "botjob_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";
}

export function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": process.env.WEB_ORIGIN ?? "http://127.0.0.1:5173",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    },
  });
}
