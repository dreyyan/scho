import 'server-only';

import { prisma } from '@/lib/prisma';
import { ACCOUNT_INFORMATION_SELECT } from '@/lib/selects/settings';
import { AccountInformationFormData } from '@/types/settings';

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
