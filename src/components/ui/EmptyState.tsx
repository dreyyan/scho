import React from 'react'
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  }
}

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className='
        flex flex-1 flex-col justify-center items-center
      '>
        <div className='flex flex-col justify-center items-center'>
          { title && <span className='text-xl font-bold'>{title}</span> }
          <span className='text-sm'>{description}</span>
        </div>
        { action && (
          <div className='mt-3'>
            <Button
              label={action.label}
              variant='destructive'
              onClick={action.onClick}
            />
          </div>
        ) }
    </div>
  )
}
