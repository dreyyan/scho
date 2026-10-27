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
      className='
      m-auto w-full max-w-md
      rounded-lg
      shadow-xl
      '
    >
      {/* Variant indicator */}
      <div className={`h-2
        ${variant === "success" ? "bg-green-600" :
          variant === "error" ? "bg-red-600" :
          variant === "confirm" ? "bg-blue-600" :
          ""
        }
      `}/>

      <div className='px-4 pt-2 pb-4'>
        <div className='flex justify-between'>
          {/* Header */}
          <h2 id={titleId} className='font-bold'>
            {title}
          </h2>
          <button
            type='button'
            onClick={onClose}
            aria-label='Close modal'
            className='
              transition-colors duration-200
              cursor-pointer
              hover:text-gray-400
            '
          >
            <X size={20} className='ml-2' />
          </button>
        </div>

        {/* Description */}
        <p id={descriptionId} className='text-md text-gray-600'>
          {description}
        </p>

        {/* Actions */}
        <div className='flex justify-end gap-x-2'>
          { secondaryAction && (
            <button
              type='button'
              onClick={secondaryAction.onClick}
              className='
                text-gray-400 text-sm font-semibold
                px-4 py-2
                rounded-md
                cursor-pointer
                transition-colors duration-300
                hover:text-gray-200
            '
            >{secondaryAction.label}</button>
          ) }
          <button
            type='button'
            onClick={primaryAction.onClick}
            className={`
              ${variant === "success" ? "bg-green-600 hover:bg-green-700" :
                variant === "error" ? "bg-red-600 hover:bg-red-700" :
                variant === "confirm" ? "bg-blue-600 hover:bg-blue-700" :
                ""
              }
              text-white text-sm font-bold
              px-4 py-2
              rounded-md
              cursor-pointer
              transition-colors duration-300
          `}>{primaryAction.label}</button>
        </div>
      </div>
    </dialog>
  )
}
