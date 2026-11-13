import React from 'react';

interface SortProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}

export default function Sort({
  value,
  onChange,
  options,
}: SortProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className='
        w-auto h-full
        px-3
        text-xs
        bg-gray-50
        border border-gray-300
        rounded-md
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
  );
}