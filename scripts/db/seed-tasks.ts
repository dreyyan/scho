import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { TaskFormData } from '@/types/task';
import { createTaskSchema } from '@/validations/task';

const sampleTasks: TaskFormData[] = [
  {
    title: 'Study for Calculus exam',
    deadline: '2026-11-15T18:00:00Z',
  },
  {
    title: 'Finish Software Engineering assignment',
    deadline: null,
  },
  {
    title: 'Buy groceries',
    deadline: null,
  },
  {
    title: 'Review React hooks',
    deadline: '2026-11-20T20:00:00Z',
  },
];

/**
 * Populates the development database with sample tasks.
 */
async function seedTasks() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Task seeding is disabled in production.');
  }

  // Find a development user to own the tasks.
  const user = await prisma.user.findUnique({
    where: {
      email: process.env.TEST_EMAIL,
    },
  });

  if (!user) {
    throw new Error('No user found. Create a user before seeding tasks.');
  }

  for (const task of sampleTasks) {
    const { title, deadline } = createTaskSchema.parse(task);

    // Avoid creating duplicate tasks.
    const existingTask = await prisma.task.findFirst({
      where: {
        userId: user.id,
        title,
      },
    });

    // Create the task if it doesn't exist yet.
    if (!existingTask) {
      await prisma.task.create({
        data: {
          userId: user.id,
          title,
          deadline,
        },
      });
    }
  }

  logger.info('Task seeding completed.');
}

seedTasks()
  .catch((err: string) => {
    logger.error('Task seeding failed: ', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { sampleTasks };
