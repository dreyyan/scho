import { NextResponse } from "next/server";
import { loginSchema } from "@/validations/auth";
import { logger } from "@/lib/logger";
import z from "zod";
import * as argon2 from "argon2";
import { prisma } from "@/lib/prisma";

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

  // Validate the incoming login data.
  const result = loginSchema.safeParse(body);

  if (!result.success) {
    // Return field-specific validation errors.
    return NextResponse.json(
      {
        error: "Invalid login data.",
        details: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      password,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { message: "Login successful." },
      { status: 200 },
    );
  } catch (err: unknown) {
    // Log unexpected login errors.
    logger.error("Login failed: ", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}