import { ComponentProps } from 'react';
import SearchBar from './SearchBar';
import Filter from './Filter';
import Sort from './Sort';
import Button from './Button';

interface ToolbarProps {
  search: ComponentProps<typeof SearchBar>;
  filter?: ComponentProps<typeof Filter>;
  sort?: ComponentProps<typeof Sort>;
  action?: ComponentProps<typeof Button>;
}

export default function Toolbar({ search, filter, sort, action }: ToolbarProps) {
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
