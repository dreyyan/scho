"use client";

import React, { useEffect, useState } from 'react'
import useModal from '@/hooks/useModal';
import { Plus } from 'lucide-react';

import FilterGroup from '@/components/ui/FilterGroup'
import Button from '@/components/ui/Button';
import Item from '@/components/ui/Item';
import TaskForm from '@/components/form/TaskForm';

import { createTask, deleteTask, editTask, getTasks } from '@/services/task.service';
import { TaskFormData, TaskResponse, UpdateTaskFormData } from '@/types/task';

const TASK_FILTER_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "All", value: "all" },
];

export default function Tasks() {
  const [activeFilter, setActiveFilter] = useState<string>(TASK_FILTER_OPTIONS[0].value);
  const [items, setItems] = useState<TaskResponse[]>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { openModal, closeModal, updateModal } = useModal();

  // Retrieve the user's tasks from the backend.
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const items = await getTasks();
        setItems(items);
      } catch (err: unknown) {
        console.error("Failed to retrieve tasks: ", err);
      }
    };
  
    fetchTasks();
  }, []);

  const handleAddTask = async (data: TaskFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    updateModal({
      primaryAction: {
        label: "Adding...",
        type: "submit",
        form: "task-form",
        isLoading: true,
      },
    });

    try {
      const newTask = await createTask(data);

      setItems((prev) => [...prev, {
        ...newTask,
      }]);

      openModal({
        variant: "success",
        title: "Task Created",
        description: "The task has been successfully created!",
        primaryAction: {
          label: "Got it",
          type: "button",
          onClick: () => closeModal(),
        },
      });
    } catch (err: unknown) {
      console.error("Failed to add task: ", err);

      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";

      openModal({
        variant: "error",
        title: "Failed Task Creation",
        description: errMsg,
        primaryAction: {
          label: "Got it",
          type: "button",
          onClick: () => closeModal(),
        },
        secondaryAction: {
          label: "Retry",
          type: "button",
          onClick: () => handleAddTask(data), 
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = async (id: string, data: UpdateTaskFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    updateModal({
      primaryAction: {
        label: "Editing...",
        type: "submit",
        form: "task-form",
        isLoading: true,
      },
    });

    try {
      const updatedTask = await editTask(id, data);

      // Update the local state of task items.
      setItems((prevItems) => prevItems.map((task) => task.id === id ? updatedTask : task));

      openModal({
        variant: "success",
        title: "Task Updated",
        description: "Task updated successfully!",
        primaryAction: {
          label: "Got it",
          type: "button",
          onClick: () => closeModal(),
        },
      });
    } catch (err: unknown) {
      console.error("Failed to edit task: ", err);

      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";

      openModal({
        variant: "error",
        title: "Updated Task Failed",
        description: errMsg,
        primaryAction: {
          label: "Got it",
          type: "button",
          onClick: () => closeModal(),
        },
        secondaryAction: {
          label: "Retry",
          type: "button",
          onClick: () => handleEditTask(id, data), 
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Immediately update the task's `isCompleted` state before sending a PATCH request to the backend server.
  const handleCheckedChange = async (id: string, checked: boolean) => {
    const prevTask = items.find((task) => task.id === id);

    if (!prevTask) return;

    // Update the UI immediately.
    setItems((prevItems) => 
      prevItems.map((item) =>
        item.id === id
        ? { ...item, isCompleted: checked }
        : item
      )
    )

    try {
      await editTask(id, { isCompleted: checked });
    } catch (err: unknown) {
      console.error("Failed to update task completion: ", err);

      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";

      // Revert the UI update if the request fails.
      setItems((prevItems) => 
        prevItems.map((item) =>
          item.id === id
          ? { ...item, isCompleted: prevTask.isCompleted }
          : item
        )
      )

      openModal({
        variant: "error",
        title: "Failed to Update Task",
        description: errMsg,
        primaryAction: {
          label: "Got it",
          type: "button",
          onClick: () => closeModal(),
        },
        secondaryAction: {
          label: "Retry",
          type: "button",
          onClick: () => {
            closeModal();
            handleCheckedChange(id, checked);
          }, 
        },
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    updateModal({
      primaryAction: {
        label: "Deleting...",
        type: "button",
        isLoading: true,
      },
    });

    try {
      await deleteTask(id);

      // Update the local state of task items.
      setItems((prevItems) => prevItems.filter((task) => task.id !== id));

      closeModal();
    } catch (err: unknown) {
      console.error("Failed to delete task: ", err);

      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";

      openModal({
        variant: "error",
        title: "Failed Task Deletion",
        description: errMsg,
        primaryAction: {
          label: "Got it",
          type: "button",
          onClick: () => closeModal(),
        },
        secondaryAction: {
          label: "Retry",
          type: "button",
          onClick: () => handleDeleteTask(id), 
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddTaskForm = () => {
    openModal({
      variant: "confirm",
      title: "Add Task",
      description: "Add a new task to your list.",
      children: (
        <TaskForm
          onSubmit={handleAddTask}
        />
      ),
      primaryAction: {
        label: "Add",
        type: "submit",
        form: "task-form",
        isLoading: isSubmitting,
      },
      secondaryAction: {
        label: "Cancel",
        onClick: closeModal,
      },
    });
  };

  const openEditTaskForm = (id: string) => {
    const task = items.find((item) => item.id === id);

    if (!task) return;

    openModal({
      variant: "confirm",
      title: "Edit Task",
      description: "Edit the current task.",
      children: (
        <TaskForm
          initialValues={task}
          onSubmit={(data) => handleEditTask(id, data)}
        />
      ),
      primaryAction: {
        label: "Edit",
        type: "submit",
        form: "task-form"
      },
      secondaryAction: {
        label: "Cancel",
        onClick: closeModal,
      },
    });
  };

  const openDeleteTaskModal = (id: string) => {
    openModal({
      variant: "error",
      title: "Delete Task",
      description: "Are you sure you want to delete this task?",
      primaryAction: {
        label: "Delete",
        type: "button",
        onClick: () => handleDeleteTask(id),
      },
      secondaryAction: {
        label: "Cancel",
        onClick: closeModal,
      },
    });
  }

  return (
    <div className='space-y-1'>
      <header className='flex justify-between items-center'>
        <h1 className='text-gray-700 font-bold'>Tasks</h1>
        <FilterGroup
          options={TASK_FILTER_OPTIONS}
          value={activeFilter}
          onChange={setActiveFilter}
        />
      </header>

      <main className='
        min-h-109
        rounded-lg
        p-6
        bg-gray-100 border-2 border-gray-300
      '>
        <div className='flex justify-center items-center gap-x-3 mb-4'>
          {/* TODO: Search bar, filter, and sort. */}
          <div className='
            flex-2
            flex justify-center items-center
            px-3 py-2
            text-sm
            bg-gray-50 border border-gray-300 rounded-md
          '>Search bar, filter, and sort.
          </div>
          <div>
            <Button
              label='Add Task'
              variant='primary'
              type='button'
              onClick={openAddTaskForm}
              icon={Plus}
            />
          </div>
        </div>

        <div className='space-y-2'>
          { items.map((task) => (
            <Item
              key={task.id}
              id={task.id}
              category='Task'
              title={task.title}
              isChecked={task.isCompleted}
              deadline={task.deadline ?? ''}
              canEdit={true}
              canDelete={true}
              onCheckedChange={(checked) =>
                handleCheckedChange(task.id, checked)
              }
              onEdit={() => openEditTaskForm(task.id)}
              onDelete={() => openDeleteTaskModal(task.id)}
            />
          )) }
        </div>
      </main>

      {/* TODO: Pagination. */}
      <div className='
        flex justify-center items-center
        mb-4 px-3 py-3
        text-sm
        bg-gray-50 border border-gray-300 rounded-md
      '>Pagination.
      </div>
    </div>
  )
}
