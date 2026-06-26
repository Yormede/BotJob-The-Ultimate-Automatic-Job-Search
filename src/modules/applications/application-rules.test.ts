import { expect, test } from "bun:test";
import {
  applyManualLastAction,
  buildApplicationSearchText,
  buildJobAxisMismatchWarnings,
} from "./application-rules";

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

test("signale une offre qui ne correspond pas a l'axe choisi", () => {
  const warnings = buildJobAxisMismatchWarnings(
    {
      title: "Backend CDI Lyon",
      contractTypes: ["CDI"],
      locations: [{ label: "Lyon" }],
    },
    {
      contractType: "Alternance",
      locationLabel: "Paris",
      fullOfferText: "Alternance frontend hybride a Paris",
    },
  );

  expect(warnings).toEqual([
    "L'offre ne semble pas correspondre aux contrats de l'axe Backend CDI Lyon.",
    "L'offre ne semble pas correspondre aux localisations de l'axe Backend CDI Lyon.",
  ]);
});

test("ne signale rien si l'offre correspond deja a l'axe", () => {
  const warnings = buildJobAxisMismatchWarnings(
    {
      title: "Backend CDI Lyon",
      contractTypes: ["CDI"],
      locations: [{ label: "Lyon" }],
    },
    {
      contractType: "CDI",
      locationLabel: "Lyon",
      fullOfferText: "Poste backend senior en CDI a Lyon",
    },
  );

  expect(warnings).toEqual([]);
});
