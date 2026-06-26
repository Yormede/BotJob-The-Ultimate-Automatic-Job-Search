export type ModelPriceInput = {
  modelKey: string;
  displayName: string;
  inputCreditsPerToken: number;
  outputCreditsPerToken: number;
  isActive: boolean;
};

export function normalizeModelPriceInput(body: Record<string, unknown>, modelKey?: string): ModelPriceInput {
  return {
    modelKey: modelKey ?? requireText(body.modelKey, "modele"),
    displayName: requireText(body.displayName, "nom du modele"),
    inputCreditsPerToken: nonNegativeNumber(body.inputCreditsPerToken, "cout input/token"),
    outputCreditsPerToken: nonNegativeNumber(body.outputCreditsPerToken, "cout output/token"),
    isActive: optionalBoolean(body.isActive) ?? true,
  };
}

export function normalizeCreditAdjustment(body: Record<string, unknown>) {
  return {
    amountCredits: nonZeroNumber(body.amountCredits, "credits"),
    reason: requireText(body.reason, "raison"),
  };
}

export function normalizeUsageInput(body: Record<string, unknown>) {
  return {
    modelKey: requireText(body.modelKey, "modele"),
    inputTokens: nonNegativeInteger(body.inputTokens, "tokens input"),
    outputTokens: nonNegativeInteger(body.outputTokens, "tokens output"),
    reason: typeof body.reason === "string" && body.reason.trim() ? body.reason.trim() : "usage modele IA",
  };
}

export function estimateCreditCost(
  price: { inputCreditsPerToken: number; outputCreditsPerToken: number },
  usage: { inputTokens: number; outputTokens: number },
) {
  return roundCredits(
    usage.inputTokens * price.inputCreditsPerToken +
      usage.outputTokens * price.outputCreditsPerToken,
  );
}

function requireText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} requis`);
  return value.trim();
}

function nonNegativeNumber(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label} invalide`);
  }
  return value;
}

function nonZeroNumber(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isFinite(value) || value === 0) {
    throw new Error(`${label} invalide`);
  }
  return value;
}

function nonNegativeInteger(value: unknown, label: string) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(`${label} invalide`);
  }
  return value;
}

function optionalBoolean(value: unknown) {
  if (value == null) return undefined;
  if (typeof value !== "boolean") throw new Error("booleen invalide");
  return value;
}

function roundCredits(value: number) {
  return Math.ceil(value * 10000) / 10000;
}
