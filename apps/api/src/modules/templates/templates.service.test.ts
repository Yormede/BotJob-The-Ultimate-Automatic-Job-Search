import { expect, test } from "bun:test";
import { normalizeTemplateInput, normalizeTemplatePatch } from "./templates.service";

test("template service > normalizes a template payload", () => {
  const input = normalizeTemplateInput({
    kind: "cv",
    name: " CV sobre ",
    htmlContent: " <article></article> ",
    isDefault: true,
  });

  expect(input).toEqual({
    kind: "cv",
    name: "CV sobre",
    description: "",
    htmlContent: "<article></article>",
    cssContent: null,
    isAtsOneColumn: true,
    isDefault: true,
  });
});

test("template service > rejects invalid kind", () => {
  expect(() => normalizeTemplateInput({ kind: "message", name: "Demo" })).toThrow();
});

test("template service > merges patch data", () => {
  const current = normalizeTemplateInput({ kind: "cover_letter", name: "Lettre" });
  const patched = normalizeTemplatePatch(current, { name: "Lettre courte", isDefault: true });

  expect(patched.kind).toBe("cover_letter");
  expect(patched.name).toBe("Lettre courte");
  expect(patched.isDefault).toBe(true);
});
