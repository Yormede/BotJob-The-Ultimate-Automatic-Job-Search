import { pingDatabase } from "./shared/db";
import { corsPreflight, json, type Handler, type HandlerContext } from "./shared/http";
import {
  loginController,
  logoutController,
  registerController,
  sessionController,
} from "./modules/auth/auth.routes";
import {
  createApplicationController,
  createApplicationEventController,
  deleteApplicationController,
  getApplicationController,
  listApplicationEventsController,
  listApplicationsController,
  updateApplicationController,
} from "./modules/applications/applications.routes";
import {
  createJobAxisController,
  deactivateJobAxisController,
  listJobAxesController,
  updateJobAxisController,
} from "./modules/job-axes/job-axes.routes";
import {
  getAiProfileController,
  upsertAiProfileController,
} from "./modules/ai-profile/ai-profile.routes";
import { dashboardController } from "./modules/dashboard/dashboard.routes";

const exactRoutes = new Map<string, Handler>([
  ["POST /api/auth/register", wrapRequest(registerController)],
  ["POST /api/auth/login", wrapRequest(loginController)],
  ["GET /api/auth/session", wrapRequest(sessionController)],
  ["POST /api/auth/logout", wrapRequest(logoutController)],
  ["GET /api/dashboard", dashboardController],
  ["GET /api/applications", listApplicationsController],
  ["POST /api/applications", createApplicationController],
  ["GET /api/job-axes", listJobAxesController],
  ["POST /api/job-axes", createJobAxisController],
  ["GET /api/ai-profile", getAiProfileController],
  ["PUT /api/ai-profile", upsertAiProfileController],
]);

const dynamicRoutes: Array<{
  method: string;
  pattern: RegExp;
  params: string[];
  handler: Handler;
}> = [
  {
    method: "GET",
    pattern: /^\/api\/applications\/([^/]+)$/,
    params: ["id"],
    handler: getApplicationController,
  },
  {
    method: "PATCH",
    pattern: /^\/api\/applications\/([^/]+)$/,
    params: ["id"],
    handler: updateApplicationController,
  },
  {
    method: "DELETE",
    pattern: /^\/api\/applications\/([^/]+)$/,
    params: ["id"],
    handler: deleteApplicationController,
  },
  {
    method: "GET",
    pattern: /^\/api\/applications\/([^/]+)\/events$/,
    params: ["id"],
    handler: listApplicationEventsController,
  },
  {
    method: "POST",
    pattern: /^\/api\/applications\/([^/]+)\/events$/,
    params: ["id"],
    handler: createApplicationEventController,
  },
  {
    method: "PATCH",
    pattern: /^\/api\/job-axes\/([^/]+)$/,
    params: ["id"],
    handler: updateJobAxisController,
  },
  {
    method: "DELETE",
    pattern: /^\/api\/job-axes\/([^/]+)$/,
    params: ["id"],
    handler: deactivateJobAxisController,
  },
];

const server = Bun.serve({
  port: Number(process.env.API_PORT ?? 3000),
  idleTimeout: 30,
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

      const exactHandler = exactRoutes.get(`${request.method} ${url.pathname}`);
      if (exactHandler) return await exactHandler({ request, params: {} });

      const dynamicMatch = matchDynamicRoute(request.method, url.pathname);
      if (dynamicMatch) return await dynamicMatch.handler({ request, params: dynamicMatch.params });

      return json({ error: "not found" }, 404);
    } catch (error) {
      return json(
        { error: error instanceof Error ? error.message : "internal server error" },
        500,
      );
    }
  },
});

console.log(`BotJob API listening on http://127.0.0.1:${server.port}`);

function wrapRequest(handler: (request: Request) => Response | Promise<Response>): Handler {
  return ({ request }) => handler(request);
}

function matchDynamicRoute(method: string, pathname: string) {
  for (const route of dynamicRoutes) {
    if (route.method !== method) continue;
    const match = pathname.match(route.pattern);
    if (!match) continue;

    return {
      handler: route.handler,
      params: Object.fromEntries(
        route.params.map((name, index) => [name, decodeURIComponent(match[index + 1])]),
      ) as HandlerContext["params"],
    };
  }

  return null;
}
