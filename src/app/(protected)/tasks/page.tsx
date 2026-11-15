'use client';

import React, { useEffect, useState } from 'react';
import useModal from '@/hooks/useModal';
import { CircleX, Loader2, Plus, ClipboardList, SearchX } from 'lucide-react';

import FilterGroup from '@/components/ui/FilterGroup';
import Button from '@/components/ui/Button';
import Item from '@/components/ui/Item';
import SearchBar from '@/components/ui/SearchBar';
import Filter from '@/components/ui/Filter';
import Sort from '@/components/ui/Sort';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import TaskForm from '@/components/form/TaskForm';

import { createTask, deleteTask, editTask } from '@/lib/api-client/task';
import { TaskFormData, UpdateTaskFormData } from '@/types/task';
import { FILTER_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS, TASKS_PER_PAGE } from '@/lib/constants/task';
import { getVisibleTasks, paginate } from '@/lib/utils/task';
import { getErrorMessage } from '@/lib/utils/error';
import useTasks from '@/hooks/useTasks';

export default function Tasks() {
  const { openModal, closeModal, updateModal } = useModal();
  const { tasks, setTasks, isLoading, error, retry } = useTasks();

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [status, setStatus] = useState<string>(STATUS_OPTIONS[0].value);
  const [sort, setSort] = useState<string>(SORT_OPTIONS[0].value);
  const [filter, setFilter] = useState<string>(FILTER_OPTIONS[0].value);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Update time every 60 seconds.
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(Date.now());
    };

    const interval = setInterval(updateTime, 60_000);

    return () => clearInterval(interval);
  }, []);

  // Retrieve the filtered and sorted tasks.
  const sortedTasks = getVisibleTasks(tasks, {
    search,
    status,
    sort,
    filter,
    currentTime,
  });

  // Calculate pages information.
  const totalPages = Math.ceil(sortedTasks.length / TASKS_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages, 1));

  // Retrieve the tasks after pagination.
  const paginatedTasks = paginate(sortedTasks, currentPage, TASKS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };
  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };
  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const renderTaskList = () => {
    if (isLoading) {
      return (
        <EmptyState description='Loading tasks...' icon={Loader2} iconClassName='animate-spin' />
      );
    }

    if (error) {
      return (
        <EmptyState
          title='Failed to load tasks'
          description={error}
          variant='error'
          action={{
            label: 'Try again',
            onClick: retry,
          }}
          icon={CircleX}
        />
      );
    }

    if (tasks.length === 0) {
      return (
        <EmptyState
          title='No tasks yet'
          description='Create your first task to get started.'
          action={{
            label: 'Add Task',
            onClick: openAddTaskForm,
          }}
          icon={ClipboardList}
        />
      );
    }

    if (sortedTasks.length === 0) {
      return (
        <EmptyState
          title='No matching tasks'
          description='No tasks match your current filters.'
          icon={SearchX}
          variant='error'
        />
      );
    }

    return paginatedTasks.map((task) => (
      <Item
        key={task.id}
        id={task.id}
        category='Task'
        title={task.title}
        isChecked={task.isCompleted}
        deadline={task.deadline ?? ''}
        canEdit={true}
        canDelete={true}
        onCheckedChange={(checked) => handleCheckedChange(task.id, checked)}
        onEdit={() => openEditTaskForm(task.id)}
        onDelete={() => openDeleteTaskModal(task.id)}
      />
    ));
  };

  const handleAddTask = async (data: TaskFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    updateModal({
      primaryAction: {
        label: 'Adding...',
        type: 'submit',
        form: 'task-form',
        isLoading: true,
      },
    });

    try {
      const newTask = await createTask(data);

      setTasks((prev) => [
        ...prev,
        {
          ...newTask,
        },
      ]);

      openModal({
        variant: 'success',
        title: 'Task Created',
        description: 'The task has been successfully created!',
        primaryAction: {
          label: 'Got it',
          type: 'button',
          onClick: () => closeModal(),
        },
      });
    } catch (err: unknown) {
      console.error('Failed to add task: ', err);

      const errMsg = getErrorMessage(err);

      openModal({
        variant: 'error',
        title: 'Failed Task Creation',
        description: errMsg,
        primaryAction: {
          label: 'Got it',
          type: 'button',
          onClick: () => closeModal(),
        },
        secondaryAction: {
          label: 'Retry',
          type: 'button',
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
        label: 'Editing...',
        type: 'submit',
        form: 'task-form',
        isLoading: true,
      },
    });

    try {
      const updatedTask = await editTask(id, data);

      // Update the local state of tasks.
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? updatedTask : task)));

      openModal({
        variant: 'success',
        title: 'Task Updated',
        description: 'Task updated successfully!',
        primaryAction: {
          label: 'Got it',
          type: 'button',
          onClick: () => closeModal(),
        },
      });
    } catch (err: unknown) {
      console.error('Failed to edit task: ', err);

      const errMsg = getErrorMessage(err);

      openModal({
        variant: 'error',
        title: 'Updated Task Failed',
        description: errMsg,
        primaryAction: {
          label: 'Got it',
          type: 'button',
          onClick: () => closeModal(),
        },
        secondaryAction: {
          label: 'Retry',
          type: 'button',
          onClick: () => handleEditTask(id, data),
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Immediately update the task's `isCompleted` state before sending a PATCH request to the backend server.
  const handleCheckedChange = async (id: string, checked: boolean) => {
    const prevTask = tasks.find((task) => task.id === id);

    if (!prevTask) return;

    // Update the UI immediately.
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === id ? { ...task, isCompleted: checked } : task)),
    );

    try {
      await editTask(id, { isCompleted: checked });
    } catch (err: unknown) {
      console.error('Failed to update task completion: ', err);

      const errMsg = getErrorMessage(err);

      // Revert the UI update if the request fails.
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === id ? { ...task, isCompleted: prevTask.isCompleted } : task,
        ),
      );

      openModal({
        variant: 'error',
        title: 'Failed to Update Task',
        description: errMsg,
        primaryAction: {
          label: 'Got it',
          type: 'button',
          onClick: () => closeModal(),
        },
        secondaryAction: {
          label: 'Retry',
          type: 'button',
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
        label: 'Deleting...',
        type: 'button',
        isLoading: true,
      },
    });

    try {
      await deleteTask(id);

      // Update the local state of task items.
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));

      closeModal();
    } catch (err: unknown) {
      console.error('Failed to delete task: ', err);

      const errMsg = getErrorMessage(err);

      openModal({
        variant: 'error',
        title: 'Failed Task Deletion',
        description: errMsg,
        primaryAction: {
          label: 'Got it',
          type: 'button',
          onClick: () => closeModal(),
        },
        secondaryAction: {
          label: 'Retry',
          type: 'button',
          onClick: () => handleDeleteTask(id),
        },
      });

      setPage(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddTaskForm = () => {
    openModal({
      variant: 'confirm',
      title: 'Add Task',
      description: 'Add a new task to your list.',
      children: <TaskForm onSubmit={handleAddTask} />,
      primaryAction: {
        label: 'Add',
        type: 'submit',
        form: 'task-form',
        isLoading: isSubmitting,
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
      title: 'Edit Task',
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
      title: 'Delete Task',
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
        <FilterGroup options={STATUS_OPTIONS} value={status} onChange={handleStatusChange} />
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
        <div
          className='
          flex justify-between items-center
          h-10 gap-x-3 mb-4
        '
        >
          {/* Left: Search, Filter, and Sort */}
          <div className='flex items-center h-10 gap-x-2'>
            <SearchBar
              value={search}
              onChange={handleSearchChange}
              placeholder='Search for tasks...'
            />
            <Filter value={filter} onChange={handleFilterChange} options={FILTER_OPTIONS} />
            <Sort value={sort} onChange={handleSortChange} options={SORT_OPTIONS} />
          </div>

          {/* Right: Primary Action Button */}
          <div className='h-full'>
            <Button
              label='Add Task'
              variant='primary'
              type='button'
              onClick={openAddTaskForm}
              icon={Plus}
            />
          </div>
        </div>

        <div
          className='
          flex flex-1 flex-col
          gap-y-2
        '
        >
          {renderTaskList()}
        </div>
      </main>

      {/* TODO: Pagination. */}
      <div
        className='
        flex justify-center items-center
        mb-4 px-3 py-3
        text-sm
      '
      >
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
