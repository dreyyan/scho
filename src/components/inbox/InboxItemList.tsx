import { CircleX, Loader2, ClipboardList, SearchX } from 'lucide-react';

import Item from '@/components/ui/Item';
import EmptyState from '@/components/ui/EmptyState';

import type { InboxItemResponse } from '@/types/inbox';

interface InboxItemListProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  inboxItems: InboxItemResponse[];
  paginatedInboxItems: InboxItemResponse[];
  visibleInboxItems: InboxItemResponse[];
  onAdd: () => void;
  onView: (id: string) => void;
  onConvert: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function InboxItemList({
  isLoading,
  error,
  onRetry,
  inboxItems,
  paginatedInboxItems,
  visibleInboxItems,
  onAdd,
  onView,
  onConvert,
  onEdit,
  onDelete,
}: InboxItemListProps) {
  if (isLoading) {
    return (
      <EmptyState
        description='Loading inbox items...'
        icon={Loader2}
        iconClassName='animate-spin'
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        title='Failed to load inbox items'
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

  if (inboxItems.length === 0) {
    return (
      <EmptyState
        title='No inbox items yet'
        description='Create your first inbox item to get started.'
        action={{
          label: 'Create your first inbox item',
          onClick: onAdd,
        }}
        icon={ClipboardList}
      />
    );
  }

  if (visibleInboxItems.length === 0) {
    return (
      <EmptyState
        title='No matching inbox items'
        description='No inbox items match your current filters.'
        icon={SearchX}
        variant='error'
      />
    );
  }

  return (
    <ul className='flex flex-1 flex-col gap-y-2'>
      {paginatedInboxItems.map((inboxItem) => (
        <li key={inboxItem.id}>
          {inboxItem.type === 'LINK' ? (
            <Item
              id={inboxItem.id}
              category='Link'
              url={inboxItem.content}
              createdAt={inboxItem.createdAt}
              title={inboxItem.content}
              canEdit={true}
              canDelete={true}
              onView={() => onView(inboxItem.id)}
              onConvert={inboxItem.task === null ? () => onConvert(inboxItem.id) : undefined}
              onEdit={() => onEdit(inboxItem.id)}
              onDelete={() => onDelete(inboxItem.id)}
            />
          ) : (
            <Item
              id={inboxItem.id}
              category='Note'
              createdAt={inboxItem.createdAt}
              title={inboxItem.content}
              canEdit={true}
              canDelete={true}
              onView={() => onView(inboxItem.id)}
              onConvert={inboxItem.task === null ? () => onConvert(inboxItem.id) : undefined}
              onEdit={() => onEdit(inboxItem.id)}
              onDelete={() => onDelete(inboxItem.id)}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
