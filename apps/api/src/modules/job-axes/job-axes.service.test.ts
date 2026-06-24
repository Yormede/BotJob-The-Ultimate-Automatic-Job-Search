import { describe, expect, test } from "bun:test";
import { normalizeJobAxisInput, normalizeJobAxisPatch } from "./job-axes.service";

describe("job axes service", () => {
  test("normalizes a job axis", () => {
    const axis = normalizeJobAxisInput({
      title: "Frontend",
      description: "React TypeScript",
      contractTypes: ["CDI", "Alternance", ""],
      locations: [{ label: "Lyon" }],
      priority: 2,
    });

    expect(axis.contractTypes).toEqual(["CDI", "Alternance"]);
    expect(axis.isActive).toBe(true);
  });

  test("merges patch data", () => {
    const current = normalizeJobAxisInput({ title: "Frontend" });
    const patched = normalizeJobAxisPatch(current, { priority: 1, isActive: false });

    expect(patched.title).toBe("Frontend");
    expect(patched.priority).toBe(1);
    expect(patched.isActive).toBe(false);
  });
});
