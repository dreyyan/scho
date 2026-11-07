import z from "zod";
import * as argon2 from "argon2";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

import { Prisma } from "@/generated/prisma/client";
import { registerSchema } from "@/validations/auth";

/**
 ** POST — Register a new user.
 * 
 * Validates registration data, hashes the password using argon2id, and
 * creates a user record in the database.
 * 
 * @param request - The HTTP request containing the registration credentials.
 * @returns a JSON response of the registered user or an error.
 */
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Malformed JSON request body." },
      { status: 400 },
    );
  }

  // Validate the incoming registration data.
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    // Return field-specific validation errors.
    return NextResponse.json(
      {
        error: "Invalid registration data.",
        details: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, password } = result.data;

  try {
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { 
        message: "User registered successfully.",
        data: { user },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    // Handle Prisma unique constraint violations (P2002).
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email is already registered." },
        { status: 409 },
      );
    }

    // Log unexpected registration errors.
    logger.error("Registration failed: ", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
};