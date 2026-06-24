import { describe, expect, test } from "bun:test";
import { normalizeAiProfileInput } from "./ai-profile.service";

describe("AI profile service", () => {
  test("normalizes flexible profile sections", () => {
    const profile = normalizeAiProfileInput({
      sections: { skills: ["React", "Bun"] },
      customInstructions: "Ton direct",
      lifeTrace: [{ label: "Projet BotJob" }],
    });

    expect(profile.sections).toEqual({ skills: ["React", "Bun"] });
    expect(profile.customInstructions).toBe("Ton direct");
    expect(profile.lifeTrace).toHaveLength(1);
  });

  test("rejects non object sections", () => {
    expect(() => normalizeAiProfileInput({ sections: [] })).toThrow("sections invalide");
  });
});
