'use client';

import { getErrorMessage } from '@/lib/utils/error';
import useModal from './useModal';

/**
 * Provides a function to show an error modal with the error's message, a 'Got it' button,
 * and an optional 'Retry' button.
 *
 * @returns A function that opens the error modal.
 */
export default function useErrorModal() {
  const { openModal, closeModal } = useModal();

  /**
   * @param title - The modal's title.
   * @param err - The caught value; its message is shown via `getErrorMessage`.
   * @param onRetry - Runs when 'Retry' is clicked. If omitted, no Retry button is shown.
   */
  const showErrorModal = (title: string, err: unknown, onRetry?: () => void) => {
    const errMsg = getErrorMessage(err);

    openModal({
      variant: 'error',
      title,
      description: errMsg,
      primaryAction: {
        label: 'Got it',
        type: 'button',
        onClick: () => closeModal(),
      },
      ...(onRetry && {
        secondaryAction: {
          label: 'Retry',
          type: 'button',
          onClick: onRetry,
        },
      }),
    });
  };

  return showErrorModal;
}
