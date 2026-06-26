import { describe, expect, test } from "bun:test";
import { buildGeneratedDocuments, normalizeGenerationInput } from "./generation.service";

const application = {
  id: "app_1",
  company: "Acme",
  jobTitle: "Developpeur React",
  fullOfferText: "React TypeScript PostgreSQL",
  userFirstName: "Ada",
  userLastName: "Lovelace",
};

describe("generation service", () => {
  test("defaults to all document kinds", () => {
    const input = normalizeGenerationInput(null);
    const documents = buildGeneratedDocuments(application, input);

    expect(documents.map((document) => document.kind)).toEqual([
      "cv",
      "cover_letter",
      "approach_message",
    ]);
  });

  test("rejects empty generation requests", () => {
    expect(() =>
      normalizeGenerationInput({
        includeCv: false,
        includeCoverLetter: false,
        includeApproachMessage: false,
      }),
    ).toThrow("au moins un document est requis");
  });

  test("keeps selected template ids on generated documents", () => {
    const input = normalizeGenerationInput({
      includeCv: true,
      includeCoverLetter: true,
      includeApproachMessage: false,
      cvTemplateId: "tpl_cv",
      coverLetterTemplateId: "tpl_letter",
    });
    const documents = buildGeneratedDocuments(application, input);

    expect(documents.map((document) => document.templateId)).toEqual(["tpl_cv", "tpl_letter"]);
  });

  test("keeps CV structure by default unless user allows changes", () => {
    const preserved = buildGeneratedDocuments(application, normalizeGenerationInput({ includeCv: true, includeCoverLetter: false, includeApproachMessage: false }));
    const flexible = buildGeneratedDocuments(application, normalizeGenerationInput({ includeCv: true, includeCoverLetter: false, includeApproachMessage: false, allowCvStructureChanges: true }));

    expect(preserved[0].isAtsOneColumn).toBe(true);
    expect(preserved[0].contentText).toContain("Structure du template conservee");
    expect(flexible[0].isAtsOneColumn).toBe(false);
    expect(flexible[0].contentText).toContain("Adaptation structurelle autorisee");
  });
});
