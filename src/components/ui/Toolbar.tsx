import { ComponentProps } from 'react';
import SearchBar from './SearchBar';
import Filter, { FilterProps } from './Filter';
import Sort, { SortProps } from './Sort';
import Button from './Button';

interface ToolbarProps<F extends string, S extends string> {
  search: ComponentProps<typeof SearchBar>;
  filter?: FilterProps<F>;
  sort?: SortProps<S>;
  action?: ComponentProps<typeof Button>;
}

export default function Toolbar<F extends string, S extends string>({
  search,
  filter,
  sort,
  action,
}: ToolbarProps<F, S>) {
  return (
    <div
      className='
      flex justify-between items-center
      h-10 gap-x-3 mb-4
    '
    >
      <div className='flex items-center h-10 gap-x-2'>
        <SearchBar {...search} />
        {filter && <Filter {...filter} />}
        {sort && <Sort {...sort} />}
      </div>

      {action && (
        <div className='h-full'>
          <Button {...action} />
        </div>
      )}
    </div>
  );
}
