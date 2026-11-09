"use client";

import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react'
interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "password" | "date" | "datetime-local";
  placeholder?: string;
  "aria-describedby"?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  required: boolean;
  error?: string;
};

export default function InputField({
  id,
  name,
  label,
  type,
  placeholder,
  "aria-describedby": describedBy,
  value,
  onChange,
  required,
  error,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className='flex flex-col'>
      <label htmlFor={id} className='
        mb-1
        text-sm font-semibold
        text-gray-700
      '>{label}</label>

      <div className='relative'>
        <input
          id={id}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          aria-describedby={describedBy}
          value={value}
          onChange={onChange}
          required={required}
          className='
            px-3 py-2 w-full rounded border border-gray-300
            text-sm
            placeholder-gray-300
            transition-colors duration-300
            outline-none
            focus:ring-2 focus:border-green-600 focus:ring-green-700/20
          '
        />

        { isPassword && (
          <button
            type='button'
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className='
              absolute right-3 top-1/2
              -translate-y-1/2
              h-full
              pl-4 pr-1
              text-gray-500 hover:text-gray-700
              cursor-pointer
            '
          >
            { showPassword ? (<EyeOff size={16}/>) : (<Eye size={16}/>) }
          </button>
        )}
        
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
