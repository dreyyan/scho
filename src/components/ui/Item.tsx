import { File, Link, X, Check, SquarePen } from 'lucide-react';
import { ItemProps } from '@/types/item';

export default function Item(props: ItemProps) {
  return (
    <div className='
      flex justify-between items-center
      px-4 py-3
      rounded-sm
      bg-gray-50
      border border-gray-300
      shadow
    '>
      <div className='flex justify-center items-center space-x-3'>
        { props.category === "Task" && (
          <label className="relative flex size-6 cursor-pointer items-center justify-center">
            <input
              type="checkbox"
              checked={props.isChecked}
              onChange={(e) => props.onCheckedChange(e.target.checked)}
              className='
                peer
                appearance-none
                size-6 rounded-full
                border-2 border-gray-600
                checked:bg-green-600
                checked:border-green-700
                active:bg-gray-300
                active:border-gray-800
                cursor-pointer
              '
            />

            <Check
              size={10}
              strokeWidth={4}
              className='
                pointer-events-none
                absolute
                text-white
                opacity-0
                peer-checked:opacity-100
                peer-active:text-transparent
              '
            />
          </label>
        )}
        { props.category === "Link" ?
          <Link
            size={20}
            className='text-gray-600'
          /> :
          props.category === "Item" ?
          <File
            size={20}
            className='text-gray-600'
          /> : ""
        }

        <span className='flex flex-col'>
          <span className='text-sm font-semibold text-gray-800 hover:underline hover:cursor-pointer'>{props.title}</span>
          <span className='text-xs'>{props.category}&nbsp;·&nbsp;
            <span className='text-gray-500'>
              { props.category === "Link" || props.category === "Item" ? props.createdAt : props.deadline }
            </span>
          </span>
        </span>
      </div>

      <div className='space-x-1'>
        { props.canEdit && (
          <button
            onClick={props.onEdit}
            className='
              p-2
              rounded
              text-gray-700
              transition-colors duration-300
              hover:text-gray-900
              hover:bg-gray-200
              cursor-pointer
            '
          >
            <SquarePen size={16} className='' />
          </button>
        )}

        { props.canDelete && (
          <button
            onClick={props.onDelete}
            className='
              p-2
              rounded
              text-red-700
              transition-colors duration-300
              hover:text-red-900
              hover:bg-red-100
              cursor-pointer
            '
          >
            <X size={16} className='' />
          </button>
        )}
      </div>
    </div>
  )
}
