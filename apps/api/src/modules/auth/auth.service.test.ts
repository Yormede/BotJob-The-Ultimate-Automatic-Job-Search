import { expect, test } from "bun:test";
import { hashToken } from "./auth.service";

test("hashToken ne conserve pas le jeton de session en clair", () => {
  const token = "session-token-demo";
  const hash = hashToken(token);

  expect(hash).not.toBe(token);
  expect(hash).toHaveLength(64);
});
