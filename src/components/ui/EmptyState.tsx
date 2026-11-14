import React from 'react'

interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className='
        flex flex-1 flex-col justify-center items-center
      '>
        <span className='text-xl font-bold'>{title}</span>
        <span>{description}</span>
    </div>
  )
}
