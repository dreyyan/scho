"use client";

import React, { useEffect, useRef, useId } from 'react'
import { X } from 'lucide-react';
import type { ModalProps } from '@/types/modal';

export default function Modal({
  isOpen,
  variant,
  title,
  description,
  children,
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
      m-auto w-md max-w-md
      rounded-lg
      shadow-xl
      '
    >
      {/* Variant indicator */}
      <div className={`h-2 bg-linear-to-t ${
          variant === "success" ? "from-green-500 to-green-700" :
          variant === "error" ? "from-red-500 to-red-700" :
          variant === "confirm" ? "from-blue-500 to-blue-700" :
          ""
        }
      `}/>

      <div className='px-4 pt-2 pb-4 space-y-2'>
        <div className='flex justify-between'>
          {/* Header */}
          <h3 id={titleId} className='font-bold text-gray-700'>
            {title}
          </h3>
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
        <p id={descriptionId} className='text-sm text-gray-600'>
          {description}
        </p>

        {/* Custom content */}
        {children && (
          <div className="py-2">
            {children}
          </div>
        )}

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
            type={primaryAction.type || 'button'}
            form={primaryAction.form}
            onClick={primaryAction.onClick}
            className={`
                bg-linear-to-br ${
                variant === "success" ? "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800" :
                variant === "error" ? "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800" :
                variant === "confirm" ? "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" :
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
