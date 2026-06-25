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
});
