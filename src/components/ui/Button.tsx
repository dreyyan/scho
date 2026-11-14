import { LucideIcon } from 'lucide-react';
import React from 'react'

interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "destructive";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
};

const BUTTON_STYLES = {
  "primary": "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
  "secondary": "bg-gray-400 hover:bg-gray-500",
  "destructive": "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
};

export default function Button({
  label,
  variant = "primary",
  type = "button",
  onClick,
  icon: Icon,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        flex justify-center items-center
        h-full w-full
        text-sm font-bold
        text-white
        bg-linear-to-r
        ${Icon ? 'pl-3 pr-4' : 'px-4' }
        py-2
        rounded-md
        cursor-pointer
        transition-colors duration-300
        whitespace-nowrap
        ${BUTTON_STYLES[variant]
        }`}
    >
      { Icon && <Icon size={16} className='mr-1' /> }
      {label}
    </button>
  )
}
