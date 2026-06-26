import { expect, test } from "bun:test";
import { estimateCreditCost, normalizeUsageInput } from "./credits.service";

test("credits service > estimates token cost", () => {
  expect(estimateCreditCost(
    { inputCreditsPerToken: 0.001, outputCreditsPerToken: 0.004 },
    { inputTokens: 1000, outputTokens: 500 },
  )).toBe(3);
});

test("credits service > rejects invalid token counts", () => {
  expect(() => normalizeUsageInput({ modelKey: "botjob", inputTokens: 1.5, outputTokens: 0 })).toThrow();
});
