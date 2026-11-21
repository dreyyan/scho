type FilterOption<T extends string> = {
  label: string;
  value: T;
};

interface FilterGroupProps<T extends string> {
  options: readonly FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function FilterGroup<T extends string>({
  options,
  value,
  onChange,
}: FilterGroupProps<T>) {
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
