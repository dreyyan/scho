import { Search } from 'lucide-react';
import React from 'react'

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search for...",
}: SearchBarProps) {
  return (
    <div
      className='
        flex items-center gap-x-2
        px-3 py-2.5
        rounded-md border border-gray-300 bg-gray-50
        h-full w-full
        '
      >
      <Search size={16} className='' />
      <input
        type='search'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className='
          text-xs
          outline-none
        '
      >

      </input>
    </div>
  )
}
