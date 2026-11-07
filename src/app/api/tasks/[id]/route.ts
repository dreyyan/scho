import { z } from "zod";
import { NextResponse } from "next/server";

import { updateTaskSchema } from "@/validations/task";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logger } from "@/lib/logger";
import { Prisma } from "@/generated/prisma/client";

/**
 ** PATCH — Update an existing task.
 * 
 * @param request - The HTTP request containing the updated task data.
 * @param context - The route context containing the task ID.
 * @returns a JSON response of the updated task or an error.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let body: unknown;
  let userId: string;
  const { id: taskId } = await params;

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

  const taskIdResult = z.uuid().safeParse(taskId);

  if (!taskIdResult.success) {
    return NextResponse.json(
      { error: "Invalid task ID." },
      { status: 400 },
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

  // Validate the incoming task update data.
  const result = updateTaskSchema.safeParse(body);

  if (!result.success) {
    // Return field-specific validation errors.
    return NextResponse.json(
      {
        error: "Invalid task update data.",
        details: z.flattenError(result.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  const { title, isCompleted } = result.data;

  try {
    const task = await prisma.task.update({
      where: {
        id: taskId,
        userId,
      },
      data: {
        title,
        isCompleted,
      },
      select: {
        id: true,
        title: true,
        isCompleted: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(
      {
        message: "Task updated successfully.",
        data: { task },
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Task not found." },
        { status: 404 },
      );
    }

    // Log unexpected task update errors.
    logger.error("Task update failed: ", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

/**
 ** DELETE — Delete an existing task.
 * 
 * @param _request - The incoming HTTP request.
 * @param context - The route context containing the task ID.
 * @returns a JSON response indicating success or failure.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let userId: string;
  const { id: taskId } = await params;

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

  const taskIdResult = z.uuid().safeParse(taskId);

  if (!taskIdResult.success) {
    return NextResponse.json(
      { error: "Invalid task ID." },
      { status: 400 },
    );
  }

  try {
    // TODO: Delete InboxItem linked with the task.
    await prisma.task.delete({
      where: {
        id: taskId,
        userId,
      },
    });

    return NextResponse.json(
      { message: "Task deleted successfully." },
      { status: 200 },
    );
  } catch (err: unknown) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Task not found." },
        { status: 404 },
      );
    }

    // Log unexpected task deletion errors.
    logger.error("Task deletion failed: ", err);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}