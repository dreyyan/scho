import { afterAll, beforeEach, beforeAll, describe, expect, it, vi } from 'vitest';
import * as argon2 from 'argon2';
import { Session } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

import { GET, PATCH } from '@/app/api/settings/route';
import { validLoginData } from '../../../fixtures/auth';
import { generateRandomEmail } from '../../../helpers/generateRandomEmail';
import { SETTINGS_API_URL } from '@/lib/constants/settings';
import { invalidSettingsData, validSettingsData } from '../../../fixtures/settings';
import { malformedJSON } from '../../../fixtures/common';

const PORT = process.env.PORT ?? 3001;
const SETTINGS_URL = `http://localhost:${PORT}${SETTINGS_API_URL}`;
const testUserData = {
  ...validLoginData,
  email: generateRandomEmail('settings'),
};

vi.mock('@/auth', () => ({ auth: vi.fn() }));
const mockAuth = vi.mocked(auth as () => Promise<Session | null>);

describe(`GET ${SETTINGS_API_URL}`, () => {
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        name: validSettingsData.accountInformation.name,
        email: testUserData.email,
        passwordHash: await argon2.hash(testUserData.password, {
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
  });

  afterAll(async () => {
    if (!testUserId) return;

    await prisma.user.delete({
      where: { id: testUserId },
    });
  });

  it("returns the user's account information successfully", async () => {
    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.message).toBe('Account information retrieved successfully.');
    expect(result.data.accountInformation.email).toBe(testUserData.email);
    expect(result.data.accountInformation).not.toHaveProperty('passwordHash');
  });

  it('rejects an unauthorized user', async () => {
    mockAuth.mockResolvedValue(null);

    const response = await GET();
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.error).toBe('Unauthorized.');
  });
});

describe(`PATCH ${SETTINGS_API_URL}`, () => {
  let testUserId: string;
  let otherUserId: string;
  let otherUserEmail: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        name: validSettingsData.accountInformation.name,
        email: testUserData.email,
        passwordHash: await argon2.hash(testUserData.password, {
          type: argon2.argon2id,
        }),
      },
    });

    testUserId = user.id;

    const otherUser = await prisma.user.create({
      data: {
        name: validSettingsData.accountInformation.name,
        email: generateRandomEmail('other'),
        passwordHash: await argon2.hash(testUserData.password, {
          type: argon2.argon2id,
        }),
      },
    });

    otherUserId = otherUser.id;
    otherUserEmail = otherUser.email;
  });

  beforeEach(async () => {
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

    await prisma.user.deleteMany({
      where: { id: { in: [testUserId, otherUserId] } },
    });
  });

  it("updates the user's account information successfully", async () => {
    const updatedEmail: string = generateRandomEmail('updated');
    const request = new Request(SETTINGS_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...validSettingsData.accountInformation, email: updatedEmail }),
    });

    const response = await PATCH(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.message).toBe('Account information updated successfully.');
    expect(result.data.accountInformation.email).toBe(updatedEmail);
  });

  it('rejects an unauthorized user', async () => {
    mockAuth.mockResolvedValue(null);

    const request = new Request(SETTINGS_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...validSettingsData.accountInformation }),
    });

    const response = await PATCH(request);
    const result = await response.json();

    expect(response.status).toBe(401);
    expect(result.error).toBe('Unauthorized.');
  });

  it('rejects malformed JSON request body', async () => {
    const request = new Request(SETTINGS_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: malformedJSON,
    });

    const response = await PATCH(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Malformed JSON request body.');
  });

  it.each([
    ['empty name', invalidSettingsData.accountInformation.emptyName],
    ['overlong name', invalidSettingsData.accountInformation.overlongName],
    ['invalid email', invalidSettingsData.accountInformation.invalidEmail],
  ])('rejects invalid account information update with %s', async (_, data) => {
    const request = new Request(SETTINGS_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const response = await PATCH(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Invalid account information update data.');
  });

  it('rejects an email already in use', async () => {
    const request = new Request(SETTINGS_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...validSettingsData.accountInformation, email: otherUserEmail }),
    });

    const response = await PATCH(request);
    const result = await response.json();

    expect(response.status).toBe(409);
    expect(result.error).toBe('Email is already in use.');
  });

  it('rejects a non-existing user', async () => {
    mockAuth.mockResolvedValue({
      user: {
        id: crypto.randomUUID(),
      },
      expires: '2026-12-31T00:00:00.000Z',
    });

    const request = new Request(SETTINGS_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...validSettingsData.accountInformation,
        email: generateRandomEmail('missing'),
      }),
    });

    const response = await PATCH(request);
    const result = await response.json();

    expect(response.status).toBe(404);
    expect(result.error).toBe('User not found.');
  });
});
