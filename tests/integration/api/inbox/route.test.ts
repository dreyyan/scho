import { afterAll, beforeEach, beforeAll, describe, expect, it, vi } from 'vitest';
import * as argon2 from 'argon2';
import { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

import {
  validInboxItemCreationData,
  invalidInboxItemCreationData,
  validInboxItemUpdateData,
} from '../../../fixtures/inbox';
import { validLoginData } from '../../../fixtures/auth';
import { malformedJSON } from '../../../fixtures/common';

import { GET, POST } from '@/app/api/inbox/route';
import { PATCH, DELETE } from '@/app/api/inbox/[id]/route';
import { generateRandomEmail } from '../../../helpers/generateRandomEmail';
import { INBOX_API_URL } from '@/lib/constants/inbox';

const PORT = process.env.PORT ?? 3001;
const INBOX_URL = `http://localhost:${PORT}${INBOX_API_URL}`;
const testLoginData = {
  ...validLoginData,
  email: generateRandomEmail('login'),
};

let testUserId: string;

vi.mock('@/auth', () => ({ auth: vi.fn() }));
const mockAuth = vi.mocked(auth as () => Promise<Session | null>);

describe(`GET ${INBOX_API_URL}`, () => {
  let testUserId: string;
  let otherUserId: string;
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

    const otherUser = await prisma.user.create({
      data: {
        email: generateRandomEmail('other'),
        passwordHash: 'x',
      },
    });

    otherUserId = otherUser.id;

    await prisma.inboxItem.create({
      data: {
        userId: otherUserId,
        content: 'Not yours',
      },
    });

    const inboxItem = await prisma.inboxItem.create({
      data: {
        userId: testUserId,
        content: 'Original inbox item content',
      },
    });

    testInboxItemId = inboxItem.id;
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

    await prisma.inboxItem.deleteMany({
      where: { userId: testUserId },
    });

    await prisma.inboxItem.deleteMany({
      where: { userId: otherUserId },
    });

    await prisma.user.delete({
      where: { id: testUserId },
    });

    await prisma.user.delete({
      where: { id: otherUserId },
    });
  });

  it("returns the user's inbox items successfully", async () => {
    const response = await GET();
    const result = await response.json();
    const inboxItemContents = result.data.inboxItems.map(
      (inboxItem: { content: string }) => inboxItem.content,
    );

    expect(response.status).toBe(200);
    expect(result.message).toBe('Inbox items retrieved successfully.');
    expect(result.data.inboxItems).toHaveLength(1);
    expect(result.data.inboxItems[0].id).toBe(testInboxItemId);
    expect(inboxItemContents).not.toContain('Not yours');
  });

  it('rejects an unauthorized user', async () => {
    mockAuth.mockResolvedValue(null);

    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.error).toBe('Unauthorized.');
  });
});

describe(`POST ${INBOX_API_URL}`, () => {
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

    await prisma.inboxItem.deleteMany({
      where: { userId: testUserId },
    });

    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  it('accepts valid inbox item creation data', async () => {
    const request = new Request(INBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validInboxItemCreationData),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.message).toBe('Inbox item created successfully.');
    expect(result.data.inboxItem).toHaveProperty('createdAt');
  });

  it('rejects an unauthorized user', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new Request(INBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validInboxItemCreationData),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.error).toBe('Unauthorized.');
  });

  it('rejects malformed JSON request body.', async () => {
    const request = new Request(INBOX_URL, {
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
    ['empty content', invalidInboxItemCreationData.emptyContent],
    ['overlong content', invalidInboxItemCreationData.overlongContent],
  ])('rejects invalid inbox item creation data with %s', async (_, data) => {
    const request = new Request(INBOX_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Invalid inbox item creation data.');
  });
});

describe(`PATCH ${INBOX_API_URL}/:id`, () => {
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

    const inboxItem = await prisma.inboxItem.create({
      data: {
        userId: testUserId,
        content: 'Original inbox item content',
      },
    });

    testInboxItemId = inboxItem.id;
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

    await prisma.inboxItem.deleteMany({
      where: { userId: testUserId },
    });

    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  it('accepts vaild inbox item update data', async () => {
    const request = new Request(`${INBOX_URL}/${testInboxItemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validInboxItemUpdateData),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: testInboxItemId }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.message).toBe('Inbox item updated successfully.');
    expect(result.data.inboxItem).toHaveProperty('createdAt');
  });
});

describe(`DELETE ${INBOX_API_URL}/:id`, () => {
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

    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  it('accepts valid inbox item deletion data', async () => {
    const request = new Request(`${INBOX_URL}/${testInboxItemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: testInboxItemId }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.message).toBe('Inbox item deleted successfully.');
  });

  it('rejects an unauthorized user', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new Request(`${INBOX_URL}/${testInboxItemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: testInboxItemId }),
    });
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.error).toBe('Unauthorized.');
  });

  it('rejects an invalid inbox item ID', async () => {
    const invalidInboxItemId = 'invalid-inbox-item-id';

    const request = new Request(`${INBOX_URL}/${invalidInboxItemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: invalidInboxItemId }),
    });
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Invalid inbox item ID.');
  });

  it('rejects a non-existing inbox item', async () => {
    const nonExistentInboxItemId = crypto.randomUUID();

    const request = new Request(`${INBOX_URL}/${nonExistentInboxItemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await DELETE(request, {
      params: Promise.resolve({ id: nonExistentInboxItemId }),
    });
    const result = await response.json();

    expect(response.status).toBe(404);
    expect(result.error).toBe('Inbox item not found.');
  });
});
