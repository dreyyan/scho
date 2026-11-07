import { afterAll, beforeEach, beforeAll, describe, expect, it, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";
import { auth } from "@/auth";
import * as argon2 from "argon2";

import { invalidTaskCreationData, validTaskCreationData, validTaskUpdateData } from "../../../fixtures/task";
import { validLoginData } from "../../../fixtures/auth";
import { malformedJSON } from "../../../fixtures/common";

import { POST } from "@/app/api/tasks/route";
import { generateRandomEmail } from "../../../helpers/generateRandomEmail";
import { PATCH } from "@/app/api/tasks/[id]/route";

const PORT = process.env.PORT ?? 3001;
const TASK_URL = `http://localhost:${PORT}/api/tasks`;
const testLoginData = {
  ...validLoginData,
  email: generateRandomEmail("login"),
}

let testUserId: string;

vi.mock("@/auth", () => ({ auth: vi.fn() }));
const mockAuth = vi.mocked(
  auth as () => Promise<Session | null>
);

describe("POST /api/tasks", () => {
  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: testLoginData.email,
        passwordHash: await argon2.hash(testLoginData.password, {
          type: argon2.argon2id,
        }),
      },
    });

    testUserId = user.id;
  });

  beforeEach(() => {
    vi.resetAllMocks();

    mockAuth.mockResolvedValue({
      user: {
        id: testUserId,
      },
      expires: "2026-12-31T00:00:00.000Z",
    });
  });

  it("accepts valid task creation data", async () => {
    const request = new Request(TASK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validTaskCreationData),
    });

    const response = await POST(request);
    const result = await response.json();


    expect(response.status).toBe(201);
    expect(result.message).toBe("Task created successfully.");
  });

  it("rejects an unauthorized user", async () => {
    mockAuth.mockResolvedValue(null);

    const request = new Request(TASK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validTaskCreationData),
    });

    const response = await POST(request);
    const result = await response.json();


    expect(response.status).toBe(401);
    expect(result.error).toBe("Unauthorized.");
  });

  it("rejects malformed JSON request body.", async () => {
    const request = new Request(TASK_URL, {
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
    ["empty title", invalidTaskCreationData.emptyTitle],
    ["overlong title", invalidTaskCreationData.overlongTitle],
  ])("rejects invalid task creation data with %s", async (_, data) => {
    const request = new Request(TASK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe("Invalid task creation data.");
  });

  it("rejects a task referencing an already linked inbox item", () => {
    // TODO: Rejects a task referencing an already linked inbox item.
  });

  afterAll(async () => {
    if (!testUserId) return;

    await prisma.task.deleteMany({
      where: { userId: testUserId },
    });

    await prisma.user.delete({
      where: { id: testUserId },
    });
  })
});

describe("PATCH /api/tasks/:id", () => {
  let testUserId: string;
  let testTaskId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: testLoginData.email,
        passwordHash: await argon2.hash(testLoginData.password, {
          type: argon2.argon2id,
        }),
      },
    });

    testUserId = user.id;

    const task = await prisma.task.create({
      data: {
        userId: testUserId,
        title: "Original task title",
      },
    });

    testTaskId = task.id;
  });

  beforeEach(() => {
    vi.resetAllMocks();

    mockAuth.mockResolvedValue({
      user: {
        id: testUserId,
      },
      expires: "2026-12-31T00:00:00.000Z",
    });
  });

  it("accepts vaild task update data", async () => {
    const request = new Request(`${TASK_URL}/${testTaskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validTaskUpdateData),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: testTaskId })
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.message).toBe("Task updated successfully.");
  });

  afterAll(async () => {
    if (!testUserId) return;

    await prisma.task.deleteMany({
      where: { userId: testUserId },
    });

    await prisma.user.delete({
      where: { id: testUserId },
    });
  });
});