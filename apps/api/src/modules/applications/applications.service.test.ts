import { describe, expect, test } from "bun:test";
import {
  normalizeApplicationInput,
  normalizeApplicationPatch,
  normalizeEventInput,
} from "./applications.service";

describe("applications service", () => {
  test("normalizes a complete application payload", () => {
    const input = normalizeApplicationInput({
      company: "  Acme  ",
      jobTitle: "Developpeur React",
      fullOfferText: "Annonce complete",
      offerUrl: "https://example.com/job",
      locationLabel: "Paris",
      contractType: "CDI",
      status: "sent",
    });

    expect(input.company).toBe("Acme");
    expect(input.status).toBe("sent");
    expect(input.searchText).toBe("acme developpeur react paris cdi sent");
  });

  test("rejects invalid status values", () => {
    expect(() =>
      normalizeApplicationInput({
        company: "Acme",
        jobTitle: "Dev",
        fullOfferText: "Annonce",
        status: "unknown",
      }),
    ).toThrow("statut invalide");
  });

  test("merges patch data with current application", () => {
    const current = normalizeApplicationInput({
      company: "Acme",
      jobTitle: "Dev",
      fullOfferText: "Annonce",
    });
    const patched = normalizeApplicationPatch(current, { status: "interview" });

    expect(patched.company).toBe("Acme");
    expect(patched.status).toBe("interview");
  });

  test("normalizes application events", () => {
    const event = normalizeEventInput({
      eventType: "next_action",
      label: "Relancer mercredi",
      state: "suggested",
    });

    expect(event.eventType).toBe("next_action");
    expect(event.author).toBe("user");
  });
});
