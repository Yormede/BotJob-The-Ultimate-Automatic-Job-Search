import { pingDatabase } from "./shared/db";
import { corsPreflight, json } from "./shared/http";
import {
  loginController,
  logoutController,
  registerController,
  sessionController,
} from "./modules/auth/auth.routes";

const routes = new Map<string, (request: Request) => Response | Promise<Response>>([
  ["POST /api/auth/register", registerController],
  ["POST /api/auth/login", loginController],
  ["GET /api/auth/session", sessionController],
  ["POST /api/auth/logout", logoutController],
]);

const server = Bun.serve({
  port: Number(process.env.API_PORT ?? 3000),
  async fetch(request) {
    try {
      if (request.method === "OPTIONS") return corsPreflight();

      const url = new URL(request.url);
      if (url.pathname === "/api/health") {
        let database = "not_configured";
        if (process.env.DATABASE_URL) {
          database = (await pingDatabase()) ? "ok" : "error";
        }

        return json({ ok: true, service: "botjob-api", database });
      }

      const handler = routes.get(`${request.method} ${url.pathname}`);
      return handler ? await handler(request) : json({ error: "not found" }, 404);
    } catch (error) {
      return json(
        { error: error instanceof Error ? error.message : "internal server error" },
        500,
      );
    }
  },
});

console.log(`BotJob API listening on http://127.0.0.1:${server.port}`);
