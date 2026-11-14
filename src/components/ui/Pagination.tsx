import React from 'react'
import Button from './Button';

interface PaginationProps {
  page: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPage,
  onPageChange,
}: PaginationProps) {
  return (
    <div className='flex justify-center items-center gap-x-4'>
      <Button
        label='<'
        variant='primary'
        type='button'
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      />
      <div className='flex justify-center items-center gap-x-1'>
        <span>Page</span>
        <span className='font-bold w-4 text-center'>{page}</span>
        <span>of</span>
        <span className='font-bold w-4 text-center'>{totalPage}</span>
      </div>
      <Button
        label='>'
        variant='primary'
        type='button'
        disabled={page >= totalPage}
        onClick={() => onPageChange(page + 1)}
      />
    </div>
  )
}
