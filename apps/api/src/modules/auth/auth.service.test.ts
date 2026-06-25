import { expect, test } from "bun:test";
import { hashAuthCode, hashToken } from "./auth.service";

test("hashToken ne conserve pas le jeton de session en clair", () => {
  const token = "session-token-demo";
  const hash = hashToken(token);

  expect(hash).not.toBe(token);
  expect(hash).toHaveLength(64);
});

test("hashAuthCode normalise le code avant hash", () => {
  expect(hashAuthCode(" 123456 ")).toBe(hashAuthCode("123456"));
  expect(hashAuthCode("123456")).toHaveLength(64);
});
