'use client';

import { getTasks } from '@/lib/api-client/task';
import { getErrorMessage } from '@/lib/utils/error';
import type { TaskResponse } from '@/types/task';
import { useEffect, useState } from 'react';

/**
 * Provides access to Task operations.
 *
 * @returns The user's tasks, loading and error state, and retry function.
 */
export default function useTasks() {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Retrieve the user's tasks from the backend.
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } catch (err: unknown) {
        console.error('Failed to retrieve tasks: ', err);
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [reloadKey]);

  const retry = () => {
    setError(null);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  return { tasks, setTasks, isLoading, error, retry };
}
