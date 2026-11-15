import 'server-only';

import { prisma } from '@/lib/prisma';
import { TASK_SELECT } from '@/lib/selects/task';

/**
 * Retrieve the user's tasks from the databsae.
 * 
 * @param userId - The user's ID.
 * @returns The user's tasks.
 */
export async function listTasks(userId: string) {
  await prisma.task.findMany({
    where: {
      userId,
    },
    select: TASK_SELECT,
  });
}