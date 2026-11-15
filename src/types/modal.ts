import { ReactNode } from "react";

/**
 * Represents the different modal variants.
 */
export type ModalVariant = "success" | "error" | "confirm";

/**
 * Defines a button action within a modal.
 */
export interface ModalAction {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  form?: string;
  isLoading?: boolean;
}

/**
 * Defines the options within a modal.
 */
export interface ModalOptions {
  variant: ModalVariant;
  title: string;
  description: string;
  children?: ReactNode;
  primaryAction: ModalAction;
  secondaryAction?: ModalAction;
}

export interface ModalProps extends ModalOptions {
  isOpen: boolean;
  onClose: () => void;
}
