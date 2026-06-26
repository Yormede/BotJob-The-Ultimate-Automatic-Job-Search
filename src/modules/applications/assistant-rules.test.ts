import { expect, test } from "bun:test";
import { assistantDecisionFromPrompt } from "./assistant-rules";

test("assistant detecte une relance candidature", () => {
  expect(assistantDecisionFromPrompt("Ajoute une relance lundi prochain")).toEqual({
    kind: "event",
    eventType: "follow_up",
    label: "Ajoute une relance lundi prochain",
  });
});

test("assistant bloque les donnees sensibles du compte", () => {
  const decision = assistantDecisionFromPrompt("change mon email");

  expect(decision.kind).toBe("forbidden");
});
