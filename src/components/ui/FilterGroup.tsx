import React from 'react';

type FilterOption = {
  label: string;
  value: string;
};

interface FilterGroupProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function FilterGroup({ options, value, onChange }: FilterGroupProps) {
  return (
    <div className='flex items-center gap-x-2'>
      {options.map((option) => (
        <button
          key={option.value}
          type='button'
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
          className={`
            rounded-full
            px-4 py-1
            ${option.value === value ? 'bg-gray-100' : 'bg-transparent'}
            text-xs
            cursor-pointer
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
