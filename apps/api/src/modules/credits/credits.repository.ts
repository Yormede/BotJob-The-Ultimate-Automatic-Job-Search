import type { SqlClient } from "../auth/auth.repository";
import type { ModelPriceInput } from "./credits.service";

export type ModelPriceRow = {
  modelKey: string;
  displayName: string;
  inputCreditsPerToken: number;
  outputCreditsPerToken: number;
  isActive: boolean;
};

export async function getCreditBalance(sql: SqlClient, userId: string) {
  const rows = await sql<{ balanceCredits: number }[]>`
    INSERT INTO credit_balances (user_id)
    VALUES (${userId})
    ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
    RETURNING balance_credits::float AS "balanceCredits"
  `;

  return rows[0];
}

export async function listModelPrices(sql: SqlClient) {
  return sql<ModelPriceRow[]>`
    SELECT
      model_key AS "modelKey",
      display_name AS "displayName",
      input_credits_per_token::float AS "inputCreditsPerToken",
      output_credits_per_token::float AS "outputCreditsPerToken",
      is_active AS "isActive"
    FROM ai_model_prices
    ORDER BY model_key
  `;
}

export async function getModelPrice(sql: SqlClient, modelKey: string) {
  const rows = await sql<ModelPriceRow[]>`
    SELECT
      model_key AS "modelKey",
      display_name AS "displayName",
      input_credits_per_token::float AS "inputCreditsPerToken",
      output_credits_per_token::float AS "outputCreditsPerToken",
      is_active AS "isActive"
    FROM ai_model_prices
    WHERE model_key = ${modelKey}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function upsertModelPrice(sql: SqlClient, input: ModelPriceInput) {
  const rows = await sql`
    INSERT INTO ai_model_prices (
      model_key,
      display_name,
      input_credits_per_token,
      output_credits_per_token,
      is_active
    )
    VALUES (
      ${input.modelKey},
      ${input.displayName},
      ${input.inputCreditsPerToken},
      ${input.outputCreditsPerToken},
      ${input.isActive}
    )
    ON CONFLICT (model_key) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      input_credits_per_token = EXCLUDED.input_credits_per_token,
      output_credits_per_token = EXCLUDED.output_credits_per_token,
      is_active = EXCLUDED.is_active,
      updated_at = now()
    RETURNING
      model_key AS "modelKey",
      display_name AS "displayName",
      input_credits_per_token::float AS "inputCreditsPerToken",
      output_credits_per_token::float AS "outputCreditsPerToken",
      is_active AS "isActive"
  `;

  return rows[0];
}

export async function addCredits(sql: SqlClient, userId: string, amountCredits: number, reason: string) {
  await sql`
    INSERT INTO credit_balances (user_id)
    VALUES (${userId})
    ON CONFLICT (user_id) DO NOTHING
  `;

  const rows = await sql`
    WITH balance AS (
      UPDATE credit_balances
      SET
        balance_credits = balance_credits + ${amountCredits},
        updated_at = now()
      WHERE user_id = ${userId}
        AND balance_credits + ${amountCredits} >= 0
      RETURNING balance_credits
    )
    INSERT INTO credit_ledger (user_id, delta_credits, balance_after, reason)
    SELECT ${userId}, ${amountCredits}, balance_credits, ${reason}
    FROM balance
    RETURNING id, delta_credits::float AS "deltaCredits", balance_after::float AS "balanceAfter", reason, created_at AS "createdAt"
  `;

  return rows[0] ?? null;
}

export async function spendCredits(
  sql: SqlClient,
  userId: string,
  input: {
    modelKey: string;
    costCredits: number;
    inputTokens: number;
    outputTokens: number;
    reason: string;
  },
) {
  const rows = await sql`
    WITH balance AS (
      UPDATE credit_balances
      SET balance_credits = balance_credits - ${input.costCredits},
          updated_at = now()
      WHERE user_id = ${userId}
        AND balance_credits >= ${input.costCredits}
      RETURNING balance_credits
    )
    INSERT INTO credit_ledger (
      user_id,
      model_key,
      delta_credits,
      balance_after,
      input_tokens,
      output_tokens,
      reason
    )
    SELECT
      ${userId},
      ${input.modelKey},
      ${-input.costCredits},
      balance_credits,
      ${input.inputTokens},
      ${input.outputTokens},
      ${input.reason}
    FROM balance
    RETURNING id, delta_credits::float AS "deltaCredits", balance_after::float AS "balanceAfter", reason, created_at AS "createdAt"
  `;

  return rows[0] ?? null;
}

export async function listCreditLedger(sql: SqlClient, userId: string) {
  return sql`
    SELECT
      id,
      model_key AS "modelKey",
      delta_credits::float AS "deltaCredits",
      balance_after::float AS "balanceAfter",
      input_tokens AS "inputTokens",
      output_tokens AS "outputTokens",
      reason,
      created_at AS "createdAt"
    FROM credit_ledger
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `;
}
