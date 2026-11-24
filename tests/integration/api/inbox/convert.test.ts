import { afterAll, beforeEach, beforeAll, describe, expect, it, vi } from 'vitest';
import * as argon2 from 'argon2';
import { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

import { validLoginData } from '../../../fixtures/auth';
import { malformedJSON } from '../../../fixtures/common';

import { POST } from '@/app/api/inbox/[id]/convert/route';
import { generateRandomEmail } from '../../../helpers/generateRandomEmail';
import { INBOX_API_URL } from '@/lib/constants/inbox';
import { invalidTaskCreationData, validTaskCreationData } from '../../../fixtures/task';

const PORT = process.env.PORT ?? 3001;
const INBOX_URL = `http://localhost:${PORT}${INBOX_API_URL}`;
const testLoginData = {
  ...validLoginData,
  email: generateRandomEmail('login'),
};

vi.mock('@/auth', () => ({ auth: vi.fn() }));
const mockAuth = vi.mocked(auth as () => Promise<Session | null>);

describe(`POST ${INBOX_API_URL}/[id]/convert`, () => {
  let testUserId: string;
  let testInboxItemId: string;

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

    const inboxItem = await prisma.inboxItem.create({
      data: {
        userId: testUserId,
        content: 'Original inbox item content',
      },
    });

    testInboxItemId = inboxItem.id;
  });

  afterAll(async () => {
    if (!testUserId) return;

    await prisma.inboxItem.deleteMany({
      where: { userId: testUserId },
    });

    await prisma.task.deleteMany({
      where: { userId: testUserId },
    });

    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  it('accepts valid task conversion data', async () => {
    const request = new Request(INBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validTaskCreationData),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: testInboxItemId }),
    });
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.message).toBe('Inbox item converted successfully.');
  });

  it('rejects the same item converted twice', async () => {
    const firstReq = new Request(INBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validTaskCreationData),
    });
    const secondReq = new Request(INBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validTaskCreationData),
    });

    await POST(firstReq, {
      params: Promise.resolve({ id: testInboxItemId }),
    });
    const secondResponse = await POST(secondReq, {
      params: Promise.resolve({ id: testInboxItemId }),
    });
    const result = await secondResponse.json();

    expect(secondResponse.status).toBe(404);
    expect(result.error).toBe('Inbox item not found.');
  });
  it("rejects converting another user's inbox item", async () => {
    const otherUser = await prisma.user.create({
      data: {
        email: generateRandomEmail('other'),
        passwordHash: await argon2.hash(testLoginData.password, {
          type: argon2.argon2id,
        }),
      },
    });

    const otherUserInboxItem = await prisma.inboxItem.create({
      data: {
        userId: otherUser.id,
        content: "Other user's inbox item content",
      },
    });

    try {
      const request = new Request(INBOX_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validTaskCreationData),
      });

      const response = await POST(request, {
        params: Promise.resolve({ id: otherUserInboxItem.id }),
      });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe('Inbox item not found.');

      const stillExists = await prisma.inboxItem.findUnique({
        where: { id: otherUserInboxItem.id },
      });
      expect(stillExists).not.toBeNull();
    } finally {
      await prisma.inboxItem.deleteMany({ where: { userId: otherUser.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    }
  });

  it('rejects an unauthorized user', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new Request(INBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validTaskCreationData),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: testInboxItemId }),
    });
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.error).toBe('Unauthorized.');
  });

  it('rejects an invalid inbox item ID', async () => {
    const invalidInboxItemId = 'invalid-inbox-item-id';
    const request = new Request(INBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validTaskCreationData),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: invalidInboxItemId }),
    });
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Invalid inbox item ID.');
  });

  it('rejects malformed JSON request body.', async () => {
    const request = new Request(INBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: malformedJSON,
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: testInboxItemId }),
    });
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Malformed JSON request body.');
  });

  it('rejects invalid task conversion data', async () => {
    const request = new Request(INBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidTaskCreationData),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: testInboxItemId }),
    });
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Invalid task conversion data.');
    expect(result.details).toBeDefined();
  });
});
