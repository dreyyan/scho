'use client';

import { useRef, useState } from 'react';

import useErrorModal from '@/hooks/useErrorModal';
import useModal from '@/hooks/useModal';
import useAccountInformation from '@/hooks/useAccountInformation';

import AccountInformationForm from '@/components/form/settings/AccountInformationForm';
import EmptyState from '@/components/ui/EmptyState';

import { AccountInformationFormData } from '@/types/settings';
import { Loader2 } from 'lucide-react';

export default function Settings() {
  const { openModal, closeModal } = useModal();
  const showErrorModal = useErrorModal();
  const { accountInformation, isLoading, error, retry, updateAccountInformation } =
    useAccountInformation();

  const isSubmittingRef = useRef<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleUpdateAccountInformation = async (data: AccountInformationFormData) => {
    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await updateAccountInformation(data);

      openModal({
        variant: 'success',
        title: 'Account information updated',
        description: 'Your account information has been successfully updated!',
        primaryAction: {
          label: 'Got it',
          type: 'button',
          onClick: () => closeModal(),
        },
      });
    } catch (err: unknown) {
      console.error('Failed to update account information: ', err);
      showErrorModal('Failed to update account information', err, () =>
        handleUpdateAccountInformation(data),
      );
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <EmptyState
        description='Loading account information...'
        icon={Loader2}
        iconClassName='animate-spin'
      />
    );
  }

  if (error) {
    return (
      <EmptyState
        title='Failed to load account information'
        description={error}
        variant='error'
        action={{
          label: 'Try again',
          onClick: retry,
        }}
      />
    );
  }

  if (!accountInformation) return null;

  return (
    <div className='space-y-1'>
      <header className='flex justify-between items-center'>
        <h1 className='text-gray-700 font-bold'>Settings</h1>
      </header>

      <main
        className='
        flex flex-col
        min-h-109
        gap-y-4
        rounded-lg
        p-6
        bg-gray-100 border-2 border-gray-300
      '
      >
        <AccountInformationForm
          initialValues={accountInformation}
          isSubmitting={isSubmitting}
          onSubmit={handleUpdateAccountInformation}
        />
        <hr className='text-gray-400' />
      </main>
    </div>
  );
}
