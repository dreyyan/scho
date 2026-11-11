import { LucideIcon } from 'lucide-react';
import React from 'react'

interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  icon?: LucideIcon;
};

const BUTTON_STYLES = {
  "primary": "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
  "secondary": "from-gray-300 to-gray-400",
};

export default function Button({
  label,
  variant = "primary",
  type = "button",
  onClick,
  icon: Icon,
}: ButtonProps) {
  return (
    <button
    type={type}
      onClick={onClick}
      className={`
        flex justify-center items-center
        w-full
        text-sm font-bold
        text-white
        bg-linear-to-r
        ${Icon ? 'pl-3 pr-4' : 'px-4' }
        py-2
        rounded-md
        cursor-pointer
        transition-colors duration-300
        ${
          variant === "primary" ? BUTTON_STYLES.primary :
          variant === "secondary" ? BUTTON_STYLES.secondary : ""
        }`}
    >
      { Icon && <Icon size={16} className='mr-1' /> }
      {label}
    </button>
  )
}
