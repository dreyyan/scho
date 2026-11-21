'use client';

import React, { useRef } from 'react';
import { Plus } from 'lucide-react';

import FilterGroup from '@/components/ui/FilterGroup';
import Pagination from '@/components/ui/Pagination';
import Toolbar from '@/components/ui/Toolbar';
import InboxItemForm from '@/components/form/InboxItemForm';

import useModal from '@/hooks/useModal';
import useInboxItems from '@/hooks/useInboxItems';
import useInboxView from '@/hooks/useInboxView';

import { InboxItemFormData, UpdateInboxItemFormData } from '@/types/inbox';
import { FILTER_OPTIONS, SORT_OPTIONS, TYPE_OPTIONS } from '@/lib/constants/inbox';
import InboxItemList from '@/components/inbox/InboxItemList';
import useErrorModal from '@/hooks/useErrorModal';

export default function Inbox() {
  const { openModal, closeModal, updateModal } = useModal();
  const showErrorModal = useErrorModal();
  const { inboxItems, isLoading, error, retry, addInboxItem, editInboxItem, deleteInboxItem } =
    useInboxItems();
  const {
    search,
    type,
    sort,
    filter,
    changeSearch,
    changeType,
    changeFilter,
    changeSort,
    changePage,
    paginatedInboxItems,
    visibleInboxItems,
    currentPage,
    totalPages,
  } = useInboxView(inboxItems);

  const isSubmittingRef = useRef<boolean>(false);

  const handleAddInboxItem = async (data: InboxItemFormData) => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;

    updateModal({
      primaryAction: {
        label: 'Adding...',
        type: 'submit',
        form: 'inbox-item-form',
        isLoading: true,
      },
    });

    try {
      await addInboxItem(data);

      openModal({
        variant: 'success',
        title: 'Inbox item created',
        description: 'The inbox item has been successfully created!',
        primaryAction: {
          label: 'Got it',
          type: 'button',
          onClick: () => closeModal(),
        },
      });
    } catch (err: unknown) {
      console.error('Failed to add inbox item: ', err);
      showErrorModal('Failed to add inbox item', err, () => handleAddInboxItem(data));
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleEditInboxItem = async (id: string, data: UpdateInboxItemFormData) => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;

    updateModal({
      primaryAction: {
        label: 'Editing...',
        type: 'submit',
        form: 'inbox-item-form',
        isLoading: true,
      },
    });

    try {
      await editInboxItem(id, data);

      openModal({
        variant: 'success',
        title: 'Inbox item updated',
        description: 'Inbox item updated successfully!',
        primaryAction: {
          label: 'Got it',
          type: 'button',
          onClick: () => closeModal(),
        },
      });
    } catch (err: unknown) {
      console.error('Failed to edit inbox item: ', err);
      showErrorModal('inbox item', err, () => handleEditInboxItem(id, data));
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleDeleteInboxItem = async (id: string) => {
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
      await deleteInboxItem(id);

      closeModal();
    } catch (err: unknown) {
      console.error('Failed to delete inbox item: ', err);
      showErrorModal('Failed to delete inbox item', err, () => handleDeleteInboxItem(id));
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const openAddInboxItemForm = () => {
    openModal({
      variant: 'confirm',
      title: 'Add inbox item',
      description: 'Add a new inbox item to your list.',
      children: <InboxItemForm onSubmit={handleAddInboxItem} />,
      primaryAction: {
        label: 'Add',
        type: 'submit',
        form: 'inbox-item-form',
      },
      secondaryAction: {
        label: 'Cancel',
        onClick: closeModal,
      },
    });
  };

  const openEditInboxItemForm = (id: string) => {
    const inboxItem = inboxItems.find((inboxItem) => inboxItem.id === id);

    if (!inboxItem) return;

    openModal({
      variant: 'confirm',
      title: 'Edit inbox item',
      description: 'Edit the current inbox item.',
      children: (
        <InboxItemForm
          initialValues={inboxItem}
          onSubmit={(data) => handleEditInboxItem(id, data)}
        />
      ),
      primaryAction: {
        label: 'Edit',
        type: 'submit',
        form: 'inbox-item-form',
      },
      secondaryAction: {
        label: 'Cancel',
        onClick: closeModal,
      },
    });
  };

  const openDeleteInboxItemModal = (id: string) => {
    openModal({
      variant: 'error',
      title: 'Delete inbox item',
      description: 'Are you sure you want to delete this inbox item?',
      primaryAction: {
        label: 'Delete',
        type: 'button',
        onClick: () => handleDeleteInboxItem(id),
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
        <h1 className='text-gray-700 font-bold'>Inbox</h1>
        <FilterGroup options={TYPE_OPTIONS} value={type} onChange={changeType} />
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
            placeholder: 'Search for inbox items...',
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
            label: 'Add inbox item',
            variant: 'primary',
            type: 'button',
            onClick: openAddInboxItemForm,
            icon: Plus,
          }}
        />
        <InboxItemList
          isLoading={isLoading}
          error={error}
          onRetry={retry}
          inboxItems={inboxItems}
          paginatedInboxItems={paginatedInboxItems}
          visibleInboxItems={visibleInboxItems}
          onAdd={openAddInboxItemForm}
          onEdit={openEditInboxItemForm}
          onDelete={openDeleteInboxItemModal}
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
