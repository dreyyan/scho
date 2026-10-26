import { useState } from 'react'

/**
 * Manages the open and closed state of a modal.
 * 
 * @returns The modal state and methods to open, close, and toggle modal. 
 */
export default function useModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openModal = () => { setIsOpen(true); }
  const closeModal = () => { setIsOpen(false); };
  const toggleModal = () => { setIsOpen((prev) => !prev); }

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
}
