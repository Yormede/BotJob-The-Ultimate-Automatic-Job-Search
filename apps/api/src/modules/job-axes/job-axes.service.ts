import type { JobAxisInput } from "./job-axes.repository";

export function normalizeJobAxisInput(body: Record<string, unknown>): JobAxisInput {
  return {
    title: requireText(body.title, "titre"),
    description: optionalText(body.description) ?? "",
    contractTypes: optionalStringArray(body.contractTypes, "types de contrat"),
    locations: optionalLocations(body.locations),
    priority: optionalPriority(body.priority),
    isActive: optionalBoolean(body.isActive) ?? true,
  };
}

export function normalizeJobAxisPatch(
  current: JobAxisInput,
  body: Record<string, unknown>,
): JobAxisInput {
  return {
    title: "title" in body ? requireText(body.title, "titre") : current.title,
    description:
      "description" in body ? optionalText(body.description) ?? "" : current.description,
    contractTypes:
      "contractTypes" in body
        ? optionalStringArray(body.contractTypes, "types de contrat")
        : current.contractTypes,
    locations: "locations" in body ? optionalLocations(body.locations) : current.locations,
    priority: "priority" in body ? optionalPriority(body.priority) : current.priority,
    isActive: "isActive" in body ? optionalBoolean(body.isActive) ?? true : current.isActive,
  };
}

function requireText(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} requis`);
  return value.trim();
}

function optionalText(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value !== "string") throw new Error("champ texte invalide");
  return value.trim();
}

function optionalStringArray(value: unknown, label: string) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new Error(`${label} invalide`);
  }

  return value.map((item) => item.trim()).filter(Boolean);
}

function optionalLocations(value: unknown) {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new Error("localisations invalides");
  return value;
}

function optionalPriority(value: unknown) {
  if (value == null || value === "") return 0;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error("priorite invalide");
  }

  return value;
}

function optionalBoolean(value: unknown) {
  if (value == null) return undefined;
  if (typeof value !== "boolean") throw new Error("etat invalide");
  return value;
}
