import { describe, expect, it } from 'vitest';
import { prisma } from '@/lib/prisma';

import { malformedJSON } from '../../../fixtures/common';
import { invalidAuthData, validRegistrationData } from '../../../fixtures/auth';

import { POST } from '@/app/api/auth/register/route';
import { generateRandomEmail } from '../../../helpers/generateRandomEmail';

const PORT = process.env.PORT ?? '3001';
const REGISTER_URL = `http://localhost:${PORT}/api/auth/register`;
const testRegistrationData = {
  ...validRegistrationData,
  email: generateRandomEmail('register'),
};

describe('POST /api/auth/register', () => {
  it('accepts valid registration data', async () => {
    const request = new Request(REGISTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRegistrationData),
    });

    try {
      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.message).toBe('User registered successfully.');
    } finally {
      await prisma.user.deleteMany({
        where: { email: testRegistrationData.email },
      });
    }
  });

  it('rejects malformed JSON request body', async () => {
    const request = new Request(REGISTER_URL, {
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
    ['invalid email', invalidAuthData.registration.invalidEmail],
    ['short password', invalidAuthData.registration.shortPassword],
    ['mismatched passwords', invalidAuthData.registration.mismatchedPasswords],
  ])('rejects invalid registration data with %s', async (_, data) => {
    const request = new Request(REGISTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error).toBe('Invalid registration data.');
  });

  it('rejects already registered email', async () => {
    const existingUser = await prisma.user.create({
      data: {
        email: testRegistrationData.email,
        passwordHash: 'test-password-hash',
      },
    });

    try {
      const request = new Request(REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testRegistrationData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(409);
      expect(result.error).toBe('Email is already registered.');
    } finally {
      await prisma.user.delete({
        where: { id: existingUser.id },
      });
    }
  });
});
