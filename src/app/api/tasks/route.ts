import { z } from "zod";
import { NextResponse } from "next/server";

import { createTaskSchema } from "@/validations/task";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { Prisma } from "@/generated/prisma/client";
import { TaskSelect } from "@/lib/selects/task";

/**
 ** GET — Retrieve the user's tasks.
 * 
 * @returns a JSON response of the user's tasks.
 */
export async function GET() {
  let userId: string;

  // Validate user authorization.
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    userId = session.user.id;
  } catch (err: unknown) {
    logger.error("Authentication failed: ", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }

  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId,
      },
      select: TaskSelect,
    });

    return NextResponse.json(
      {
        message: "Tasks retrieved successfully.",
        data: { tasks },
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    // Log unexpected task retrieving errors.
    logger.error("Retrieving tasks failed: ", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

/**
 ** POST — Create a new task.
 *
 * @param request - The HTTP request containing the new task data.
 * @returns a JSON response of the new task or an error.
 */
export async function POST(request: Request) {
  let body: unknown;
  let userId: string;

  // Validate user authorization.
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    userId = session.user.id;
  } catch (err: unknown) {
    logger.error("Authentication failed: ", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Malformed JSON request body." },
      { status: 400 },
    );
  }

  // Validate the incoming task creation data.
  const result = createTaskSchema.safeParse(body);

  if (!result.success) {
    // Return field-specific validation errors.
    return NextResponse.json(
      {
        error: "Invalid task creation data.",
        details: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const { title, sourceItemId, deadline } = result.data;

  try {
    // TODO: Validate whether InboxItem belongs to the user.

    const task = await prisma.task.create({
      data: {
        userId,
        ...(sourceItemId !== undefined && { sourceItemId }),
        title,
        deadline,
      },
      select: TaskSelect,
    });

    return NextResponse.json(
      {
        message: "Task created successfully.",
        data: { task },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Task with the same inbox item already exists." },
        { status: 409 },
      );
    }

    // Log unexpected task creation errors.
    logger.error("Task creation failed: ", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}