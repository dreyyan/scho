import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/validations/auth";
import { validRegistrationData, validLoginData } from "../../fixtures/auth";

describe("Registration Validation", () => {
  it("accepts valid registration credentials", () => {
    const result = registerSchema.safeParse(validRegistrationData);
    expect(result.success).toBe(true);
  });
});

describe("Login Validation", () => {
  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse(validLoginData);
    expect(result.success).toBe(true);
  });
});