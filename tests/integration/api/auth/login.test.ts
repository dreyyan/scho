import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import * as argon2 from "argon2";

import { invalidAuthData, validLoginData } from "../../../fixtures/auth";
import { malformedJSON } from "../../../fixtures/common";

import { POST } from "@/app/api/auth/login/route";
import { generateRandomEmail } from "../../../helpers/generateRandomEmail";

const PORT = process.env.PORT ?? 3001;
const LOGIN_URL = `http://localhost:${PORT}/api/auth/login`;
const testLoginData = {
  ...validLoginData,
  email: generateRandomEmail("login"),
}

describe("POST /api/auth/login", () => {
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        email: testLoginData.email,
        passwordHash: await argon2.hash(testLoginData.password, {
          type: argon2.argon2id,
        }),
      },
    });
  });

  it("accepts valid login data", async () => {
    const request = new Request(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testLoginData),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.message).toBe("Login successful.");
  });

  it("rejects malformed JSON request body", async () => {
    const request = new Request(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: malformedJSON,
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe("Malformed JSON request body.");
  });

  it.each([
    ["invalid email", invalidAuthData.login.invalidEmail],
    ["empty password", invalidAuthData.login.emptyPassword],
  ])("rejects invalid login data with %s", async (_, data) => {
    const request = new Request(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe("Invalid login data.");
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testLoginData.email },
    });
  })
});