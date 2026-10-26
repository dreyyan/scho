import React from 'react'

interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

const BUTTON_STYLES = {
  "primary": "bg-green-600 hover:bg-green-700",
  "secondary": "bg-gray-600 hover:bg-gray-700",
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
