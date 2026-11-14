import Button from './Button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description: string;
  variant?: 'default' | 'error';
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }
  icon?: LucideIcon;
}

const TEXT_VARIANTS = {
  "default": "text-gray-700",
  "error": "text-red-700",
}

export default function EmptyState({
  title,
  description,
  variant = 'default',
  action,
  icon: Icon,
}: EmptyStateProps) {
  return (
    <div className='
        flex flex-1 flex-col justify-center items-center
      '>
        <div className='flex flex-col justify-center items-center'>
          { Icon && <Icon size={72} className={`${TEXT_VARIANTS[variant]} mb-4`} /> }
          { title && <span className={`${TEXT_VARIANTS[variant]} text-xl font-bold`}>{title}</span> }
          <span className='text-sm'>{description}</span>
        </div>
        { action && (
          <div className='mt-3'>
            <Button
              label={action.label}
              variant={action.variant}
              onClick={action.onClick}
            />
          </div>
        ) }
    </div>
  )
}
