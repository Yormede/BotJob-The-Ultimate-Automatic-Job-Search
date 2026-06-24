import { expect, test } from "bun:test";
import { applyManualLastAction, buildApplicationSearchText } from "./application-rules";

test("modifier la derniere action vide la prochaine action suggeree", () => {
  const result = applyManualLastAction(
    { lastAction: "CV envoye", nextAction: "Relancer dans 7 jours" },
    "Entretien planifie",
  );

  expect(result).toEqual({
    lastAction: "Entretien planifie",
    nextAction: "",
  });
});

test("le texte de recherche exclut les longs contenus et normalise les champs courts", () => {
  const result = buildApplicationSearchText([
    "Worldline",
    "Alternance Developpeur",
    "Lyon",
    "Relance 1",
    null,
    "  Contact RH  ",
  ]);

  expect(result).toBe("worldline alternance developpeur lyon relance 1 contact rh");
});
