import React from 'react'

interface FilterProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

export default function Filter({
  value,
  onChange,
  options,
}: FilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='
        text-xs
        w-auto h-full
        px-3 py-2
        rounded-md
        bg-gray-50
        border border-gray-300
        focus:outline-none
        focus:ring focus:ring-green-500
      '
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
