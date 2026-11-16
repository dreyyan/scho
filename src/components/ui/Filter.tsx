'use client';

import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';

export interface FilterProps<T extends string> {
  value: T;
  options: readonly { label: string; value: T }[];
  onChange: (value: T) => void;
}

export default function Filter<T extends string>({ value, onChange, options }: FilterProps<T>) {
  return (
    <Select.Root value={value} onValueChange={(v) => onChange(v as T)}>
      <Select.Trigger
        aria-label='Filter tasks'
        className='
          flex items-center justify-between gap-2
          text-xs
          w-auto h-10
          px-3 py-2
          rounded-md
          bg-gray-50
          border border-gray-300
          focus:outline-none
          focus:ring focus:ring-green-500
          whitespace-nowrap
        '
      >
        <Select.Value placeholder='Filter' />
        <Select.Icon>
          <ChevronDown size={14} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position='popper'
          sideOffset={4}
          className='
            z-50
            min-w-(--radix-select-trigger-width)
            rounded-md
            bg-white
            border border-gray-300
            shadow-md
            p-1
          '
        >
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className='
                  relative
                  flex items-center
                  px-3 py-2 pr-8
                  rounded-sm
                  text-xs
                  cursor-pointer
                  outline-none
                  data-highlighted:bg-green-50
                  data-highlighted:text-green-700
                '
              >
                <Select.ItemText>{option.label}</Select.ItemText>

                <Select.ItemIndicator className='absolute right-2'>
                  <Check size={14} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
