import { expect, test } from "bun:test";
import { hashAuthCode, hashToken, normalizeNewPasswordInput } from "./auth.service";

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

test("normalizeNewPasswordInput refuse des mots de passe differents", () => {
  expect(() =>
    normalizeNewPasswordInput({
      login: "demo@example.test",
      code: "123456",
      newPassword: "Password123!",
      confirmPassword: "Password321!",
    }),
  ).toThrow("mots de passe differents");
});

test("normalizeNewPasswordInput valide un reset correct", () => {
  expect(
    normalizeNewPasswordInput({
      login: "demo@example.test",
      code: "123456",
      newPassword: "Password123!",
      confirmPassword: "Password123!",
    }),
  ).toEqual({
    login: "demo@example.test",
    code: "123456",
    newPassword: "Password123!",
  });
});
