import { CircleX, Loader2, ClipboardList, SearchX } from 'lucide-react';

import Item from '@/components/ui/Item';
import EmptyState from '@/components/ui/EmptyState';

import type { TaskResponse } from '@/types/task';

interface TaskListProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  tasks: TaskResponse[];
  paginatedTasks: TaskResponse[];
  visibleTasks: TaskResponse[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({
  isLoading,
  error,
  onRetry,
  tasks,
  paginatedTasks,
  visibleTasks,
  onAdd,
  onEdit,
  onToggle,
  onDelete,
}: TaskListProps) {
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
          onClick: onRetry,
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
          onClick: onAdd,
        }}
        icon={ClipboardList}
      />
    );
  }

  if (visibleTasks.length === 0) {
    return (
      <EmptyState
        title='No matching tasks'
        description='No tasks match your current filters.'
        icon={SearchX}
        variant='error'
      />
    );
  }

  return (
    <ul className='flex flex-1 flex-col gap-y-2'>
      {paginatedTasks.map((task) => (
        <li key={task.id}>
          <Item
            id={task.id}
            category='Task'
            title={task.title}
            isChecked={task.isCompleted}
            deadline={task.deadline ?? ''}
            canEdit={true}
            canDelete={true}
            onCheckedChange={(checked) => onToggle(task.id, checked)}
            onEdit={() => onEdit(task.id)}
            onDelete={() => onDelete(task.id)}
          />
        </li>
      ))}
    </ul>
  );
}
