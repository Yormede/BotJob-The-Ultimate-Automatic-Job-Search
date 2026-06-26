import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  test.skip("V1 e2e requires DATABASE_URL", () => {});
} else {
  const port = "3101";
  const baseUrl = `http://127.0.0.1:${port}`;
  let server: ChildProcessWithoutNullStreams | null = null;
  let serverOutput = "";

  beforeAll(async () => {
    await runCommand("bun", ["apps/api/src/migrate.ts"]);

    server = spawn("bun", ["apps/api/src/main.ts"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        API_PORT: port,
        NODE_ENV: "development",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    server.stdout.on("data", (chunk) => {
      serverOutput += chunk.toString();
    });
    server.stderr.on("data", (chunk) => {
      serverOutput += chunk.toString();
    });

    await waitForHealth(baseUrl, server);
  });

  afterAll(async () => {
    const sql = new Bun.SQL(databaseUrl);
    try {
      await sql`DELETE FROM users WHERE email LIKE ${"codex-v1-e2e-%@example.test"}`;
    } finally {
      await sql.close();
    }

    if (server && !server.killed) {
      server.kill();
    }
  });

  describe("BotJob V1 e2e", () => {
    test("critical MVP journey stays functional end to end", async () => {
      const stamp = Date.now();
      const email = `codex-v1-e2e-${stamp}@example.test`;
      const username = `codex-v1-e2e-${stamp}`;
      const initialPassword = "Initial123!";
      const nextPassword = "Updated123!";
      const jar: string[] = [];

      const api = async (
        path: string,
        init: RequestInit = {},
      ): Promise<{ response: Response; data: any }> => {
        const response = await fetch(`${baseUrl}${path}`, {
          ...init,
          headers: {
            ...(init.body ? { "content-type": "application/json" } : {}),
            ...(jar.length ? { cookie: jar.join("; ") } : {}),
            ...init.headers,
          },
        });
        const data = await response.json();

        for (const entry of response.headers.getSetCookie?.() ?? []) {
          const cookie = entry.split(";", 1)[0];
          const name = cookie.split("=")[0];
          const index = jar.findIndex((item) => item.startsWith(`${name}=`));
          if (index >= 0) jar[index] = cookie;
          else jar.push(cookie);
        }

        return { response, data };
      };

      let result = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email,
          username,
          password: initialPassword,
          firstName: "Codex",
          lastName: "E2E",
        }),
      });
      expect(result.response.status).toBe(201);
      expect(result.data.verificationCode).toHaveLength(6);

      result = await api("/api/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({
          email,
          code: result.data.verificationCode,
        }),
      });
      expect(result.response.status).toBe(200);
      expect(result.data.user.email).toBe(email);

      result = await api("/api/auth/session");
      expect(result.data.user.email).toBe(email);

      result = await api("/api/dashboard");
      expect(typeof result.data.dashboard.stats.total).toBe("number");
      expect(Array.isArray(result.data.dashboard.recentApplications)).toBe(true);

      result = await api("/api/job-axes", {
        method: "POST",
        body: JSON.stringify({
          title: "Backend CDI Lyon",
          description: "Alternance et CDI backend",
          contractTypes: ["CDI"],
          locations: [{ label: "Lyon" }],
          priority: 1,
        }),
      });
      expect(result.response.status).toBe(201);
      const axisId = result.data.jobAxis.id as string;

      result = await api("/api/templates", {
        method: "POST",
        body: JSON.stringify({
          kind: "cv",
          name: "Template E2E",
          description: "Version 1",
          htmlContent: "<article>v1</article>",
          cssContent: "article { color: red; }",
          isAtsOneColumn: true,
          isDefault: false,
        }),
      });
      expect(result.response.status).toBe(201);
      const templateId = result.data.template.id as string;

      result = await api(`/api/templates/${templateId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: "Template E2E modifie",
          description: "Version 2",
          htmlContent: "<article>v2</article>",
          isDefault: true,
        }),
      });
      expect(result.response.status).toBe(200);
      expect(result.data.template.name).toBe("Template E2E modifie");

      result = await api("/api/applications", {
        method: "POST",
        body: JSON.stringify({
          jobAxisId: axisId,
          company: "Acme",
          jobTitle: "Developpeur Backend",
          offerUrl: "https://example.test/jobs/acme-backend",
          fullOfferText: "CDI backend a Lyon avec Bun et PostgreSQL.",
          locationLabel: "Lyon",
          contractType: "CDI",
          status: "draft",
        }),
      });
      expect(result.response.status).toBe(201);
      const applicationId = result.data.application.id as string;

      result = await api("/api/applications");
      expect(result.data.applications.some((application: { id: string }) => application.id === applicationId)).toBe(
        true,
      );

      result = await api(`/api/applications/${applicationId}/generate`, {
        method: "POST",
        body: JSON.stringify({
          includeCv: true,
          includeCoverLetter: false,
          includeApproachMessage: false,
          cvTemplateId: templateId,
          allowCvStructureChanges: false,
        }),
      });
      expect(result.response.status).toBe(201);
      expect(result.data.documents).toHaveLength(1);
      expect(result.data.documents[0].templateId).toBe(templateId);

      result = await api(`/api/applications/${applicationId}/events`, {
        method: "POST",
        body: JSON.stringify({
          eventType: "next_action",
          label: "Relancer mardi",
          author: "assistant",
        }),
      });
      expect(result.response.status).toBe(201);

      result = await api(`/api/applications/${applicationId}/events`);
      expect(result.data.events[0].author).toBe("assistant");

      result = await api("/api/credits");
      expect(result.response.status).toBe(200);
      expect(typeof result.data.balance.balanceCredits).toBe("number");

      result = await api("/api/credits/adjust", {
        method: "POST",
        body: JSON.stringify({
          amountCredits: 10,
          reason: "e2e credit seed",
        }),
      });
      expect(result.response.status).toBe(200);
      expect(result.data.balance.balanceCredits).toBe(10);

      result = await api("/api/credits/quote", {
        method: "POST",
        body: JSON.stringify({
          modelKey: "botjob-default",
          inputTokens: 1000,
          outputTokens: 500,
        }),
      });
      expect(result.response.status).toBe(200);
      expect(result.data.costCredits).toBe(2);

      result = await api("/api/credits/spend", {
        method: "POST",
        body: JSON.stringify({
          modelKey: "botjob-default",
          inputTokens: 1000,
          outputTokens: 500,
          reason: "e2e generation usage",
        }),
      });
      expect(result.response.status).toBe(200);
      expect(result.data.balance.balanceCredits).toBe(8);

      result = await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ login: email }),
      });
      expect(result.response.status).toBe(200);
      expect(result.data.resetCode).toHaveLength(6);

      result = await api("/api/auth/new-password", {
        method: "POST",
        body: JSON.stringify({
          login: email,
          code: result.data.resetCode,
          newPassword: nextPassword,
          confirmPassword: nextPassword,
        }),
      });
      expect(result.response.status).toBe(200);
      expect(result.data.ok).toBe(true);

      jar.length = 0;
      result = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          login: email,
          password: nextPassword,
        }),
      });
      expect(result.response.status).toBe(200);
      expect(result.data.user.email).toBe(email);
    }, 30000);
  });

  async function waitForHealth(url: string, child: ChildProcessWithoutNullStreams) {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      if (child.exitCode != null) {
        throw new Error(`API server exited early: ${serverOutput}`);
      }

      try {
        const response = await fetch(`${url}/api/health`);
        if (response.ok) return;
      } catch {}

      await Bun.sleep(200);
    }

    throw new Error(`API server did not become healthy: ${serverOutput}`);
  }

  async function runCommand(command: string, args: string[]) {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });

    const code = await new Promise<number>((resolve, reject) => {
      child.on("error", reject);
      child.on("close", resolve);
    });

    if (code !== 0) {
      throw new Error(`${command} ${args.join(" ")} failed: ${output}`);
    }
  }
}
