'use client';

import React, { useRef } from 'react';
import { Plus } from 'lucide-react';

import FilterGroup from '@/components/ui/FilterGroup';
import Pagination from '@/components/ui/Pagination';
import Toolbar from '@/components/ui/Toolbar';
import TaskForm from '@/components/form/TaskForm';

import useModal from '@/hooks/useModal';
import useTasks from '@/hooks/useTasks';
import useTaskView from '@/hooks/useTaskView';

import { TaskFormData, UpdateTaskFormData } from '@/types/task';
import { FILTER_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from '@/lib/constants/task';
import TaskList from '@/components/tasks/TaskList';
import useErrorModal from '@/hooks/useErrorModal';

export default function Tasks() {
  const { openModal, closeModal, updateModal } = useModal();
  const showErrorModal = useErrorModal();
  const { tasks, isLoading, error, retry, addTask, toggleTask, editTask, deleteTask } = useTasks();
  const {
    search,
    status,
    sort,
    filter,
    changeSearch,
    changeStatus,
    changeFilter,
    changeSort,
    changePage,
    paginatedTasks,
    visibleTasks,
    currentPage,
    totalPages,
  } = useTaskView(tasks);

  const isSubmittingRef = useRef<boolean>(false);

  const handleAddTask = async (data: TaskFormData) => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;

    updateModal({
      primaryAction: {
        label: 'Adding...',
        type: 'submit',
        form: 'task-form',
        isLoading: true,
      },
    });

    try {
      await addTask(data);

      openModal({
        variant: 'success',
        title: 'Task created',
        description: 'The task has been successfully created!',
        primaryAction: {
          label: 'Got it',
          type: 'button',
          onClick: () => closeModal(),
        },
      });
    } catch (err: unknown) {
      console.error('Failed to add task: ', err);
      showErrorModal('Failed to add task', err, () => handleAddTask(data));
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleEditTask = async (id: string, data: UpdateTaskFormData) => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;

    updateModal({
      primaryAction: {
        label: 'Editing...',
        type: 'submit',
        form: 'task-form',
        isLoading: true,
      },
    });

    try {
      await editTask(id, data);

      openModal({
        variant: 'success',
        title: 'Task updated',
        description: 'Task updated successfully!',
        primaryAction: {
          label: 'Got it',
          type: 'button',
          onClick: () => closeModal(),
        },
      });
    } catch (err: unknown) {
      console.error('Failed to edit task: ', err);
      showErrorModal('Failed to edit task', err, () => handleEditTask(id, data));
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleCheckedChange = async (id: string, checked: boolean) => {
    try {
      await toggleTask(id, checked);
    } catch (err: unknown) {
      console.error('Failed to update task completion: ', err);
      showErrorModal('Failed to update task completion', err, () => {
        closeModal();
        handleCheckedChange(id, checked);
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;

    updateModal({
      primaryAction: {
        label: 'Deleting...',
        type: 'button',
        isLoading: true,
      },
    });

    try {
      await deleteTask(id);

      closeModal();
    } catch (err: unknown) {
      console.error('Failed to delete task: ', err);
      showErrorModal('Failed to delete task', err, () => handleDeleteTask(id));
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const openAddTaskForm = () => {
    openModal({
      variant: 'confirm',
      title: 'Add task',
      description: 'Add a new task to your list.',
      children: <TaskForm onSubmit={handleAddTask} />,
      primaryAction: {
        label: 'Add',
        type: 'submit',
        form: 'task-form',
      },
      secondaryAction: {
        label: 'Cancel',
        onClick: closeModal,
      },
    });
  };

  const openEditTaskForm = (id: string) => {
    const task = tasks.find((task) => task.id === id);

    if (!task) return;

    openModal({
      variant: 'confirm',
      title: 'Edit task',
      description: 'Edit the current task.',
      children: <TaskForm initialValues={task} onSubmit={(data) => handleEditTask(id, data)} />,
      primaryAction: {
        label: 'Edit',
        type: 'submit',
        form: 'task-form',
      },
      secondaryAction: {
        label: 'Cancel',
        onClick: closeModal,
      },
    });
  };

  const openDeleteTaskModal = (id: string) => {
    openModal({
      variant: 'error',
      title: 'Delete task',
      description: 'Are you sure you want to delete this task?',
      primaryAction: {
        label: 'Delete',
        type: 'button',
        onClick: () => handleDeleteTask(id),
      },
      secondaryAction: {
        label: 'Cancel',
        onClick: closeModal,
      },
    });
  };

  return (
    <div className='space-y-1'>
      <header className='flex justify-between items-center'>
        <h1 className='text-gray-700 font-bold'>Tasks</h1>
        <FilterGroup options={STATUS_OPTIONS} value={status} onChange={changeStatus} />
      </header>

      <main
        className='
        flex flex-col
        min-h-109
        rounded-lg
        p-6
        bg-gray-100 border-2 border-gray-300
      '
      >
        <Toolbar
          search={{
            value: search,
            onChange: changeSearch,
            placeholder: 'Search for tasks...',
          }}
          filter={{
            value: filter,
            onChange: changeFilter,
            options: FILTER_OPTIONS,
          }}
          sort={{
            value: sort,
            onChange: changeSort,
            options: SORT_OPTIONS,
          }}
          action={{
            label: 'Add Task',
            variant: 'primary',
            type: 'button',
            onClick: openAddTaskForm,
            icon: Plus,
          }}
        />
        <TaskList
          isLoading={isLoading}
          error={error}
          onRetry={retry}
          tasks={tasks}
          paginatedTasks={paginatedTasks}
          visibleTasks={visibleTasks}
          onAdd={openAddTaskForm}
          onEdit={openEditTaskForm}
          onToggle={handleCheckedChange}
          onDelete={openDeleteTaskModal}
        />
      </main>

      <div
        className='
        flex justify-center items-center
        mb-4 px-3 py-3
        text-sm
      '
      >
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={changePage} />
      </div>
    </div>
  );
}
