import { afterAll, beforeEach, beforeAll, describe, expect, it, vi } from 'vitest';
import * as argon2 from 'argon2';
import { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

import {
  invalidTaskCreationData,
  validTaskCreationData,
  validTaskUpdateData,
} from '../../../fixtures/task';
import { validLoginData } from '../../../fixtures/auth';
import { malformedJSON } from '../../../fixtures/common';

import { GET, POST } from '@/app/api/tasks/route';
import { PATCH, DELETE } from '@/app/api/tasks/[id]/route';
import { generateRandomEmail } from '../../../helpers/generateRandomEmail';
import { TASKS_API_URL } from '@/lib/constants/task';

const PORT = process.env.PORT ?? 3001;
const TASK_URL = `http://localhost:${PORT}${TASKS_API_URL}`;
const testLoginData = {
  ...validLoginData,
  email: generateRandomEmail('login'),
};

let testUserId: string;

vi.mock('@/auth', () => ({ auth: vi.fn() }));
const mockAuth = vi.mocked(auth as () => Promise<Session | null>);

describe(`GET ${TASKS_API_URL}`, () => {
  let testUserId: string;
  let otherUserId: string;
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

    const otherUser = await prisma.user.create({
      data: {
        email: generateRandomEmail('other'),
        passwordHash: 'x',
      },
    });

    otherUserId = otherUser.id;

    await prisma.task.create({
      data: {
        userId: otherUserId,
        title: 'Not yours',
      },
    });

    const task = await prisma.task.create({
      data: {
        userId: testUserId,
        title: 'Original task title',
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
      expires: '2026-12-31T00:00:00.000Z',
    });
  });

  afterAll(async () => {
    if (!testUserId) return;

    await prisma.task.deleteMany({
      where: { userId: testUserId },
    });

    await prisma.task.deleteMany({
      where: { userId: otherUserId },
    });

    await prisma.user.delete({
      where: { id: testUserId },
    });

    await prisma.user.delete({
      where: { id: otherUserId },
    });
  });

  it("returns the user's tasks successfully", async () => {
    const response = await GET();
    const result = await response.json();
    const taskTitles = result.data.tasks.map((task: { title: string }) => task.title);

    expect(response.status).toBe(200);
    expect(result.message).toBe('Tasks retrieved successfully.');
    expect(result.data.tasks).toHaveLength(1);
    expect(result.data.tasks[0].id).toBe(testTaskId);
    expect(taskTitles).not.toContain('Not yours');
  });

  it('rejects an unauthorized user', async () => {
    mockAuth.mockResolvedValue(null);

    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.error).toBe('Unauthorized.');
  });
});

describe(`POST ${TASKS_API_URL}`, () => {
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
      expires: '2026-12-31T00:00:00.000Z',
    });
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

  it('accepts valid task creation data', async () => {
    const request = new Request(TASK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validTaskCreationData),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.message).toBe('Task created successfully.');
    expect(result.data.task).toHaveProperty('createdAt');
  });

  it('rejects an unauthorized user', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new Request(TASK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validTaskCreationData),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.error).toBe('Unauthorized.');
  });

  it('rejects malformed JSON request body.', async () => {
    const request = new Request(TASK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: malformedJSON,
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Malformed JSON request body.');
  });

  it.each([
    ['empty title', invalidTaskCreationData.emptyTitle],
    ['overlong title', invalidTaskCreationData.overlongTitle],
  ])('rejects invalid task creation data with %s', async (_, data) => {
    const request = new Request(TASK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Invalid task creation data.');
  });

  it('rejects a task referencing an already linked inbox item', () => {
    // TODO: Rejects a task referencing an already linked inbox item.
  });
});

describe(`PATCH ${TASKS_API_URL}/:id`, () => {
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
        title: 'Original task title',
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
      expires: '2026-12-31T00:00:00.000Z',
    });
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

  it('accepts vaild task update data', async () => {
    const request = new Request(`${TASK_URL}/${testTaskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validTaskUpdateData),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: testTaskId }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.message).toBe('Task updated successfully.');
    expect(result.data.task).toHaveProperty('createdAt');
  });

  it.each([
    ['completed', true],
    ['incomplete', false],
  ])('marks a task as %s', async (_, isCompleted) => {
    const request = new Request(`${TASK_URL}/${testTaskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isCompleted }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: testTaskId }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data.task.isCompleted).toBe(isCompleted);
  });
});

describe(`DELETE ${TASKS_API_URL}/:id`, () => {
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
  });

  beforeEach(async () => {
    vi.resetAllMocks();

    mockAuth.mockResolvedValue({
      user: {
        id: testUserId,
      },
      expires: '2026-12-31T00:00:00.000Z',
    });

    const task = await prisma.task.create({
      data: {
        userId: testUserId,
        title: 'Original task title',
      },
    });

    testTaskId = task.id;
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

  it('accepts valid task deletion data', async () => {
    const request = new Request(`${TASK_URL}/${testTaskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: testTaskId }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.message).toBe('Task deleted successfully.');
  });

  it('rejects an unauthorized user', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new Request(`${TASK_URL}/${testTaskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: testTaskId }),
    });
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.error).toBe('Unauthorized.');
  });

  it('rejects an invalid task ID', async () => {
    const invalidTaskId = 'invalid-task-id';

    const request = new Request(`${TASK_URL}/${invalidTaskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: invalidTaskId }),
    });
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Invalid task ID.');
  });

  it('rejects a non-existing task', async () => {
    const nonExistentTaskId = crypto.randomUUID();

    const request = new Request(`${TASK_URL}/${nonExistentTaskId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: nonExistentTaskId }),
    });
    const result = await response.json();

    expect(response.status).toBe(404);
    expect(result.error).toBe('Task not found.');
  });
});
