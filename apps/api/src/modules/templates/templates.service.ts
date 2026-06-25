import type { TemplateInput, TemplateKind } from "./templates.repository";

export function normalizeTemplateInput(body: Record<string, unknown>): TemplateInput {
  return {
    kind: templateKind(body.kind),
    name: requireText(body.name, "nom"),
    description: optionalText(body.description) ?? "",
    htmlContent: optionalText(body.htmlContent),
    cssContent: optionalText(body.cssContent),
    isAtsOneColumn: optionalBoolean(body.isAtsOneColumn) ?? true,
    isDefault: optionalBoolean(body.isDefault) ?? false,
  };
}

export function normalizeTemplatePatch(
  current: TemplateInput,
  body: Record<string, unknown>,
): TemplateInput {
  return {
    kind: "kind" in body ? templateKind(body.kind) : current.kind,
    name: "name" in body ? requireText(body.name, "nom") : current.name,
    description:
      "description" in body ? optionalText(body.description) ?? "" : current.description,
    htmlContent: "htmlContent" in body ? optionalText(body.htmlContent) : current.htmlContent,
    cssContent: "cssContent" in body ? optionalText(body.cssContent) : current.cssContent,
    isAtsOneColumn:
      "isAtsOneColumn" in body
        ? optionalBoolean(body.isAtsOneColumn) ?? true
        : current.isAtsOneColumn,
    isDefault:
      "isDefault" in body ? optionalBoolean(body.isDefault) ?? false : current.isDefault,
  };
}

function templateKind(value: unknown): TemplateKind {
  if (value === "cv" || value === "cover_letter") return value;
  throw new Error("type de template invalide");
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

function optionalBoolean(value: unknown) {
  if (value == null) return undefined;
  if (typeof value !== "boolean") throw new Error("booleen invalide");
  return value;
}
