import 'server-only';

import { prisma } from '@/lib/prisma';
import * as argon2 from 'argon2';

import { ACCOUNT_INFORMATION_SELECT } from '@/lib/selects/settings';
import { AccountInformationFormData, ChangePasswordFormData } from '@/types/settings';

/**
 * Retrieve the user's account information from the database.
 *
 * @param userId - The user's ID.
 * @returns The user's account information.
 */
export async function fetchAccountInformation(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: ACCOUNT_INFORMATION_SELECT,
  });
}

/**
 * Update the user's account information in the database.
 *
 * @param userId - The user's ID.
 * @param data - The form data for the updated account information.
 * @returns The updated account information.
 */
export async function updateAccountInformation(userId: string, data: AccountInformationFormData) {
  const { name, email } = data;

  return prisma.user.update({
    where: {
      id: userId,
    },
    select: ACCOUNT_INFORMATION_SELECT,
    data: {
      name,
      email,
    },
  });
}

/**
 * Update the user's password in the database.
 *
 * @param userId - The user's ID.
 * @param data - The form data for the password change.
 * @returns A status code indicating success or failure.
 */
export async function changePassword(
  userId: string,
  data: ChangePasswordFormData,
): Promise<'USER_NOT_FOUND' | 'INVALID_PASSWORD' | 'SUCCESS'> {
  const { currentPassword, newPassword } = data;

  const user = await prisma.user.findUnique({
    select: { passwordHash: true },
    where: { id: userId },
  });

  if (!user) {
    return 'USER_NOT_FOUND';
  }

  const isValidPassword = await argon2.verify(user.passwordHash, currentPassword);

  if (!isValidPassword) {
    return 'INVALID_PASSWORD';
  }

  const newPasswordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
  });

  await prisma.user.update({
    where: {
      id: userId,
    },
    select: {
      id: true,
    },
    data: {
      passwordHash: newPasswordHash,
    },
  });

  return 'SUCCESS';
}
