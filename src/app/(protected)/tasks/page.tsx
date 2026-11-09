"use client";

import React, { useEffect, useState } from 'react'
import useModal from '@/hooks/useModal';
import { Plus } from 'lucide-react';

import FilterGroup from '@/components/ui/FilterGroup'
import Button from '@/components/ui/Button';
import Item from '@/components/ui/Item';
import TaskForm from '@/components/form/TaskForm';

import { createTask, deleteTask, getTasks } from '@/services/task.service';
import { TaskFormData, TaskResponse } from '@/types/task';

const TASK_FILTER_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "All", value: "all" },
];

export default function Tasks() {
  const [activeFilter, setActiveFilter] = useState<string>(TASK_FILTER_OPTIONS[0].value);
  const [items, setItems] = useState<TaskResponse[]>([]);

  const { openModal, closeModal } = useModal(); 

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

  const handleCheckedChange = (id: string, checked: boolean) => {
    setItems((prevItems) => 
      prevItems.map((item) =>
        item.id === id
        ? { ...item, isCompleted: checked }
        : item
      )
    )
  };

  const handleAddTask = async (data: TaskFormData) => {
    try {
      const newTask = await createTask(data);

      setItems((prev) => [...prev, {
        ...newTask,
      }]);

      closeModal();
    } catch (err: unknown) {
      console.error("Failed to add task: ", err);
    }
  };

  const handleEditTask = (id: string) => {
    console.log(`TODO: Handle edit for ${id}.`);
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);

      // Update the local state of task items.
      setItems((prevItems) => prevItems.filter((task) => task.id !== id));

      closeModal();
    } catch (err: unknown) {
      console.error("Failed to delete task: ", err);
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
      },
      secondaryAction: {
        label: "Cancel",
        onClick: closeModal,
      },
    });
  };

  const openEditTaskForm = (id: string) => {
    openModal({
      variant: "confirm",
      title: "Edit Task",
      description: "Edit the current task.",
      children: (
        <TaskForm
          onSubmit={() => handleEditTask(id)}
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
            px-3 py-3
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
