"use client";

import React, { useEffect, useRef, useId } from 'react'
import { X } from 'lucide-react';
import type { ModalProps } from '@/types/modal';

export default function Modal({
  isOpen,
  variant,
  title,
  description,
  primaryAction,
  secondaryAction,
  onClose,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Toggle modal visibility.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className=''
    >
      {/* Variant indicator */}
      <div className={`h-2
        ${variant === "success" ? "bg-green-500" :
          variant === "error" ? "bg-red-500" :
          variant === "confirm" ? "bg-blue-500" :
          ""
        }
      `}></div>
      <div className='flex justify-between'>
        {/* Header */}
        <h2 id={titleId} className=''>
          {title}
        </h2>
        <button type='button' onClick={onClose} aria-label='Close modal'>
          <X size={20} />
        </button>
      </div>

      {/* Description */}
      <p id={descriptionId}>
        {description}
      </p>

      {/* Actions */}
      <div>
        { secondaryAction && (<button type='button' onClick={secondaryAction.onClick}>{secondaryAction.label}</button>) }
        <button type='button' onClick={primaryAction.onClick}>{primaryAction.label}</button>
      </div>
    </dialog>
  )
}
