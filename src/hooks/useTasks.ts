'use client';

import * as taskApi from '@/lib/api-client/task';
import { getErrorMessage } from '@/lib/utils/error';
import type { TaskResponse, UpdateTaskFormData } from '@/types/task';
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
   * Optimistically updates a task's `isCompleted` in local state, then saves it to the server.
   *
   * @param id - The task's ID.
   * @param isCompleted - The task's `isCompleted` field.
   * @throws If the request fails; the optimistic update is reverted.
   */
  const toggleTask = async (id: string, isCompleted: boolean) => {
    const prevTask = tasks.find((task) => task.id === id);

    if (!prevTask) return;

    try {
      // Update the UI immediately (optimistic update).
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? { ...task, isCompleted } : task)),
      );

      await taskApi.editTask(id, { isCompleted });
    } catch (err: unknown) {
      // Revert the UI update if the request fails.
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, isCompleted: prevTask.isCompleted } : task,
        ),
      );

      throw err;
    }
  };

  /**
   * Updates a task on the server, then updates it in local state.
   *
   * @param id - The task's ID.
   * @param data - The task data from the form.
   * @throws If the request fails; local state is left unchanged.
   */
  const editTask = async (id: string, data: UpdateTaskFormData) => {
    const updatedTask = await taskApi.editTask(id, data);

    setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? updatedTask : task)));
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
    editTask,
    toggleTask,
    deleteTask,
  };
}
