"use client";

import { useContext } from "react";
import { ModalContext } from "@/contexts/ModalContext";

/**
 * Provides access to the global modal context.
 *
 * @returns Methods to open and close the global modal.
 */
export default function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  return context;
}
