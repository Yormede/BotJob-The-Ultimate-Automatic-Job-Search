import type { AiProfileInput } from "./ai-profile.repository";

export function normalizeAiProfileInput(body: Record<string, unknown>): AiProfileInput {
  return {
    sections: optionalObject(body.sections, "sections"),
    customInstructions: optionalText(body.customInstructions) ?? "",
    lifeTrace: optionalArray(body.lifeTrace, "trace de vie"),
  };
}

function optionalObject(value: unknown, label: string) {
  if (value == null) return {};
  if (typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} invalide`);
  return value as Record<string, unknown>;
}

function optionalArray(value: unknown, label: string) {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error(`${label} invalide`);
  return value;
}

function optionalText(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new Error("champ texte invalide");
  return value.trim();
}
