import { getSql } from "../../shared/db";
import { badRequest, json, readJson, type HandlerContext } from "../../shared/http";
import { AuthRequiredError, requireSessionUser, unauthorized } from "../../shared/session";
import {
  addCredits,
  getCreditBalance,
  getModelPrice,
  listCreditLedger,
  listModelPrices,
  spendCredits,
  upsertModelPrice,
} from "./credits.repository";
import {
  estimateCreditCost,
  normalizeCreditAdjustment,
  normalizeModelPriceInput,
  normalizeUsageInput,
} from "./credits.service";

export async function creditOverviewController({ request }: HandlerContext) {
  return withCreditRequest(request, async (sql, userId) => {
    const [balance, models, ledger] = await Promise.all([
      getCreditBalance(sql, userId),
      listModelPrices(sql),
      listCreditLedger(sql, userId),
    ]);
    return json({ balance, models, ledger });
  });
}

export async function adjustCreditsController({ request }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  return withCreditRequest(request, async (sql, userId) => {
    const input = normalizeCreditAdjustment(body);
    const ledger = await addCredits(sql, userId, input.amountCredits, input.reason);
    if (!ledger) return badRequest("credits insuffisants");
    const balance = await getCreditBalance(sql, userId);
    return json({ balance, ledger });
  });
}

export async function upsertModelPriceController({ request, params }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  return withCreditRequest(request, async (sql) => {
    const model = await upsertModelPrice(sql, normalizeModelPriceInput(body, params.modelKey));
    return json({ model });
  });
}

export async function quoteCreditsController({ request }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  return withCreditRequest(request, async (sql) => {
    const usage = normalizeUsageInput(body);
    const model = await getModelPrice(sql, usage.modelKey);
    if (!model || !model.isActive) return json({ error: "modele introuvable" }, 404);
    return json({ model, costCredits: estimateCreditCost(model, usage) });
  });
}

export async function spendCreditsController({ request }: HandlerContext) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return badRequest("JSON invalide");

  return withCreditRequest(request, async (sql, userId) => {
    const usage = normalizeUsageInput(body);
    const model = await getModelPrice(sql, usage.modelKey);
    if (!model || !model.isActive) return json({ error: "modele introuvable" }, 404);

    const costCredits = estimateCreditCost(model, usage);
    const ledger = await spendCredits(sql, userId, { ...usage, costCredits });
    if (!ledger) return badRequest("credits insuffisants");
    const balance = await getCreditBalance(sql, userId);
    return json({ balance, ledger, costCredits });
  });
}

async function withCreditRequest(
  request: Request,
  callback: (sql: ReturnType<typeof getSql>, userId: string) => Promise<Response>,
) {
  const sql = getSql();
  try {
    const user = await requireSessionUser(sql, request);
    return await callback(sql, user.id);
  } catch (error) {
    if (error instanceof AuthRequiredError) return unauthorized();
    return badRequest(error instanceof Error ? error.message : "credits invalides");
  } finally {
    await sql.close();
  }
}
