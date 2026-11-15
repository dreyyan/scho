import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/validations/auth";
import {
  validRegistrationData,
  validLoginData,
  invalidAuthData,
} from "../../fixtures/auth";

describe("Registration Validation", () => {
  it("accepts valid registration credentials", () => {
    const result = registerSchema.safeParse(validRegistrationData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse(
      invalidAuthData.registration.invalidEmail,
    );
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse(
      invalidAuthData.registration.shortPassword,
    );
    expect(result.success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse(
      invalidAuthData.registration.shortPassword,
    );
    expect(result.success).toBe(false);
  });
});

describe("Login Validation", () => {
  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse(validLoginData);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse(invalidAuthData.login.invalidEmail);
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse(invalidAuthData.login.emptyPassword);
    expect(result.success).toBe(false);
  });
});
