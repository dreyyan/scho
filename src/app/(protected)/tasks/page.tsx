"use client";

import FilterGroup from '@/components/ui/FilterGroup'
import Item from '@/components/ui/Item';
import React, { useState } from 'react'
import { ItemProps } from '@/types/item';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';

const TASK_FILTER_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "All", value: "all" },
];

// TODO: Retrieve items from the backend.
const ITEMS: ItemProps[] = [
  {
    id: "0",
    category: "Task",
    title: "Review Software Engineering Notes",
    isChecked: true,
    onCheckedChange: () => {},
    canEdit: true,
    canDelete: true,
    onEdit: () => {},
    onDelete: () => {},
    deadline: "Due tomorrow",
  },
  {
    id: "1",
    category: "Task",
    title: "Review Software Engineering Notes",
    isChecked: true,
    onCheckedChange: () => {},
    canEdit: true,
    canDelete: true,
    onEdit: () => {},
    onDelete: () => {},
    deadline: "Due tomorrow",
  },
  {
    id: "2",
    category: "Task",
    title: "Review Software Engineering Notes",
    isChecked: true,
    onCheckedChange: () => {},
    canEdit: true,
    canDelete: true,
    onEdit: () => {},
    onDelete: () => {},
    deadline: "Due tomorrow",
  },
  {
    id: "3",
    category: "Task",
    title: "Review Software Engineering Notes",
    isChecked: true,
    onCheckedChange: () => {},
    canEdit: true,
    canDelete: true,
    onEdit: () => {},
    onDelete: () => {},
    deadline: "Due tomorrow",
  },
  {
    id: "4",
    category: "Task",
    title: "Review Software Engineering Notes",
    isChecked: true,
    onCheckedChange: () => {},
    canEdit: true,
    canDelete: true,
    onEdit: () => {},
    onDelete: () => {},
    deadline: "Due tomorrow",
  },
  {
    id: "5",
    category: "Task",
    title: "Review Software Engineering Notes",
    isChecked: true,
    onCheckedChange: () => {},
    canEdit: true,
    canDelete: true,
    onEdit: () => {},
    onDelete: () => {},
    deadline: "Due tomorrow",
  },
];

export default function Tasks() {
  const [activeFilter, setActiveFilter] = useState<string>(TASK_FILTER_OPTIONS[0].value);
  const [items, setItems] = useState<ItemProps[]>(ITEMS);

  const handleCheckedChange = (id: string, checked: boolean) => {
    setItems((prevItems) => 
      prevItems.map((item) =>
        item.id === id && item.category === "Task"
        ? { ...item, isChecked: checked }
        : item
      )
    )
  };

  const handleAddTask = () => {
    return null;
  };

  const handleEdit = (id: string) => {
    console.log(`TODO: Handle edit for ${id}.`);
  };

  const handleDelete = (id: string) => {
    console.log(`TODO: Handle delete for ${id}.`);
  };

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
              onClick={handleAddTask}
              icon={Plus}
            />
          </div>
        </div>

        <div className='space-y-2'>
          { items.map((item) => (
            <Item
              key={item.id}
              {...item}
              {...(item.category === "Task" && {
                onCheckedChange(checked: boolean) {
                  handleCheckedChange(item.id, checked); 
                },
              })}
              onEdit={() => handleEdit(item.id)}
              onDelete={() => handleDelete(item.id)}
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
