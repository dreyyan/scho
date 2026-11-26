'use client';

import { useRef, useState } from 'react';

import useErrorModal from '@/hooks/useErrorModal';
import useModal from '@/hooks/useModal';
import useAccountInformation from '@/hooks/useAccountInformation';

import AccountInformationForm from '@/components/form/settings/AccountInformationForm';
import EmptyState from '@/components/ui/EmptyState';

import { AccountInformationFormData, ChangePasswordFormData } from '@/types/settings';
import { Loader2 } from 'lucide-react';
import ChangePasswordForm from '@/components/form/settings/ChangePasswordForm';
import { changePassword } from '@/lib/api-client/settings';

export default function Settings() {
  const { openModal, closeModal } = useModal();
  const showErrorModal = useErrorModal();
  const { accountInformation, isLoading, error, retry, updateAccountInformation } =
    useAccountInformation();

  const [passwordFormKey, setPasswordFormKey] = useState<number>(0);

  const isSubmittingAccountInformationRef = useRef<boolean>(false);
  const [isSubmittingAccountInformation, setIsSubmittingAccountInformation] =
    useState<boolean>(false);
  const isSubmittingChangePasswordRef = useRef<boolean>(false);
  const [isSubmittingChangePassword, setIsSubmittingChangePassword] = useState<boolean>(false);

  const handleUpdateAccountInformation = async (data: AccountInformationFormData) => {
    if (isSubmittingAccountInformationRef.current) return;

    isSubmittingAccountInformationRef.current = true;
    setIsSubmittingAccountInformation(true);

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
      isSubmittingAccountInformationRef.current = false;
      setIsSubmittingAccountInformation(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    if (isSubmittingChangePasswordRef.current) return;

    isSubmittingChangePasswordRef.current = true;
    setIsSubmittingChangePassword(true);

    try {
      await changePassword(data);
      setPasswordFormKey((prev) => prev + 1);

      openModal({
        variant: 'success',
        title: 'Password changed',
        description: 'Your password has been successfully changed!',
        primaryAction: {
          label: 'Got it',
          type: 'button',
          onClick: () => closeModal(),
        },
      });
    } catch (err: unknown) {
      console.error('Failed to change password: ', err);
      showErrorModal('Failed to change password', err, () => handleChangePassword(data));
    } finally {
      isSubmittingChangePasswordRef.current = false;
      setIsSubmittingChangePassword(false);
    }
  };

  if (isLoading) {
    return (
      <EmptyState description='Loading settings...' icon={Loader2} iconClassName='animate-spin' />
    );
  }

  if (error) {
    return (
      <EmptyState
        title='Failed to load settings'
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
          isSubmitting={isSubmittingAccountInformation}
          onSubmit={handleUpdateAccountInformation}
        />
        <hr className='text-gray-400' />
        <ChangePasswordForm
          key={passwordFormKey}
          isSubmitting={isSubmittingChangePassword}
          onSubmit={handleChangePassword}
        />
      </main>
    </div>
  );
}
