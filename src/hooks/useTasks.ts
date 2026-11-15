'use client';

import * as taskApi from '@/lib/api-client/task';
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
    let ignore = false;

    const fetchTasks = async () => {
      try {
        const fetchedTasks = await taskApi.getTasks();
        if (!ignore) setTasks(fetchedTasks);
      } catch (err: unknown) {
        if (!ignore) {
          console.error('Failed to retrieve tasks: ', err);
          setError(getErrorMessage(err));
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchTasks();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setError(null);
    setIsLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  /**
   * Deletes a task on the server, then removes it from the local state.
   *
   * @param id - The task's ID.
   * @throws If the request fails; local state is left unchanged.
   */
  const deleteTask = async (id: string) => {
    await taskApi.deleteTask(id);

    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  return {
    tasks,
    setTasks,
    isLoading,
    error,
    retry,
    deleteTask,
  };
}
