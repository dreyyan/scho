import 'server-only';

import { prisma } from '@/lib/prisma';
import { INBOX_ITEM_SELECT } from '@/lib/selects/inbox';
import { InboxItemFormData, UpdateInboxItemFormData } from '@/types/inbox';
import { Prisma } from '@/generated/prisma/client';
import { getInboxItemType } from '@/lib/utils/inbox';
import { TaskFormData } from '@/types/task';
import { TASK_SELECT, TaskRecord } from '@/lib/selects/task';

/**
 * Retrieve the user's inbox item from the database.
 *
 * @param userId - The user's ID.
 * @returns The user's inbox items.
 */
export async function listInboxItems(userId: string) {
  return prisma.inboxItem.findMany({
    where: {
      userId,
    },
    select: INBOX_ITEM_SELECT,
  });
}

/**
 * Create an inbox item for the user in the database.
 *
 * @param userId - The user's ID.
 * @param data - The form data for the new inbox item.
 * @returns The new inbox item.
 */
export async function createInboxItem(userId: string, data: InboxItemFormData) {
  const { content } = data;

  try {
    return await prisma.inboxItem.create({
      data: {
        userId,
        content,
        type: getInboxItemType(content),
      },
      select: INBOX_ITEM_SELECT,
    });
  } catch (err: unknown) {
    throw err;
  }
}

/**
 * Update a user's inbox item in the database.
 *
 * @param userId - The user's ID.
 * @param inboxItemId - The inbox item's ID.
 * @param data - THe form data for the updated inbox item.
 * @returns The updated inbox item.
 */
export async function updateInboxItem(
  userId: string,
  inboxItemId: string,
  data: UpdateInboxItemFormData,
) {
  const { content } = data;

  try {
    return await prisma.inboxItem.update({
      where: {
        id: inboxItemId,
        userId,
      },
      data: {
        content,
        type: getInboxItemType(content),
      },
      select: INBOX_ITEM_SELECT,
    });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return null;
    }

    throw err;
  }
}

/**
 * Convert a user's inbox item into a task in the database.
 *
 * @param userId - The user's ID.
 * @param inboxItemId - The inbox item's ID.
 * @param data - The form data for the task to be converted.
 * @returns The converted task, or null if the inbox item isn't found or isn't owned by the user.
 */
export async function convertInboxItem(
  userId: string,
  inboxItemId: string,
  data: TaskFormData,
): Promise<TaskRecord | null> {
  const { title, deadline } = data;

  return prisma.$transaction(async (tx) => {
    // Verify user's inbox item ownership.
    const inboxItem = await tx.inboxItem.findFirst({
      where: {
        id: inboxItemId,
        userId,
      },
    });

    if (!inboxItem) return null;

    // Create task from inbox item.
    const convertedTask = await tx.task.create({
      data: {
        userId,
        title,
        deadline,
      },
      select: TASK_SELECT,
    });

    // Delete the inbox item.
    await tx.inboxItem.delete({
      where: {
        id: inboxItemId,
        userId,
      },
    });

    return convertedTask;
  });
}

/**
 * Delete a user's inbox item from the database.
 *
 * @param userId - THe user's ID;
 * @param inboxItemId - The inbox item's ID.
 * @returns True or false, depending on whether the operation succeeded.
 */
export async function deleteInboxItem(userId: string, inboxItemId: string): Promise<boolean> {
  try {
    await prisma.inboxItem.delete({
      where: {
        id: inboxItemId,
        userId,
      },
    });

    return true;
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return false;
    }

    throw err;
  }
}
