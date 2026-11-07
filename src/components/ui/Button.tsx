import React from 'react'

interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

const BUTTON_STYLES = {
  "primary": "from-green-600 to-green-700 hover:from-green-700 hover:to-green-800",
  "secondary": "from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800",
};

export default function Button({
  label,
  variant = "primary",
  type = "button",
  onClick,
}: ButtonProps) {
  return (
    <button
    type={type}
      onClick={onClick}
      className={`
        w-full
        text-sm font-bold
        text-white
        bg-linear-to-r
        px-4 py-3
        rounded-md
        cursor-pointer
        transition-colors duration-300
        ${
          variant === "primary" ? BUTTON_STYLES.primary :
          variant === "secondary" ? BUTTON_STYLES.secondary : ""
        }`}
    >
      {label}
    </button>
  )
}
