import React from 'react'
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description: string;
  variant?: 'default' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  }
}

const TEXT_VARIANTS = {
  "default": "text-gray-700",
  "error": "text-red-700",
}

export default function EmptyState({
  title,
  description,
  variant = 'default',
  action,
}: EmptyStateProps) {
  return (
    <div className='
        flex flex-1 flex-col justify-center items-center
      '>
        <div className='flex flex-col justify-center items-center'>
          { title && <span className={`${
            variant === 'default' ? TEXT_VARIANTS.default :
            variant === 'error' ? TEXT_VARIANTS.error : ''
            } text-xl font-bold`}>{title}</span> }
          <span className='text-sm'>{description}</span>
        </div>
        { action && (
          <div className='mt-3'>
            <Button
              label={action.label}
              variant='secondary'
              onClick={action.onClick}
            />
          </div>
        ) }
    </div>
  )
}
