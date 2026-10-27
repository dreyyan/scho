"use client";

import {
  createContext,
  useState,
  type ReactNode,
} from "react";

import Modal from "@/components/ui/Modal";
import type { ModalOptions } from "@/types/modal";

export interface ModalContextType {
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
}

export const ModalContext = 
  createContext<ModalContextType | null>(null);

/**
 * Manages global modal state and actions.
 */
export function ModalProvider({
  children,
}: { children: ReactNode; }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null);

  const openModal = (options: ModalOptions) => {
    setModalOptions(options) ;
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false) ;
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {modalOptions && (
        <Modal
          {...modalOptions}
          isOpen={isOpen}
          onClose={closeModal}
        />
      )}
    </ModalContext.Provider>
  )
}
