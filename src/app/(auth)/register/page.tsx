"use client";

import React, { useState } from 'react'
import z from 'zod';
import { registerSchema } from '@/validations/auth';
import InputField from '@/components/ui/InputField'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo';
import useModal from '@/hooks/useModal';

type RegisterFormData = z.input<typeof registerSchema>;

export default function Register() {
  const { openModal, closeModal } = useModal();
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setRegisterForm((prev) => (
      { ...prev, [name]: value, }
    ));
  };

  const handleRegister = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent browser's default form submission behavior.

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();

      if (!res.ok) {
        const details = data.details as Record<string, string[]> | undefined;

        const firstError = details
          ? Object.values(details).flat().find(Boolean)
          : undefined;

        openModal({
          variant: "error",
          title: "Registration Failed",
          description:
            firstError ??
            data.error ??
            "An unexpected error occurred. Please try again.",
          primaryAction: {
            label: "Try again",
            onClick: closeModal,
          },
        });

        return;
      }

      openModal({
        variant: "success",
        title: "Registration Successful",
        description: "Your account was created successfully!",
        primaryAction: {
          label: "Got it",
          onClick: closeModal,
        },
      });
    } catch (err: unknown) {
      openModal({
        variant: "error",
        title: "Registration Failed",
        description: err instanceof Error ? err.message : "An unexpected error occured, please try again.",
        primaryAction: {
          label: "Try again",
          onClick: closeModal,
        },
      });
    }
  };

  return (
    <div className='flex min-h-screen justify-center items-center'>
      <section className='
        w-full max-w-md
        px-6 py-8
        bg-gray-50
        border border-gray-200
        rounded-lg
        shadow-md
      '>
        <form onSubmit={handleRegister} className='space-y-3'>
          <header className='mb-4'>
            <Logo />
            <h1 className='text-gray-700'>Sign up</h1>
          </header>

          <hr className='text-gray-500 mb-6' />

          <InputField
            id='email'
            name='email'
            label='Email'
            type='email'
            placeholder='example@domain.com'
            value={registerForm.email}
            onChange={handleChange}
          />

          {/* Password input field with requirements. */}
          <div className='space-y-1'>
            <InputField
              id='password'
              name='password'
              label='Password'
              type='password'
              placeholder='********'
              value={registerForm.password}
              onChange={handleChange}
            />
            <p className='text-xs text-gray-500'>
              At least 8 characters, including uppercase, lowercase, and a symbol.
            </p>
          </div>

          <InputField
            id='confirm-password'
            name='confirmPassword'
            label='Confirm Password'
            type='password'
            placeholder='********'
            aria-describedby="password-requirements"
            value={registerForm.confirmPassword}
            onChange={handleChange}
          />
          
          <div className='pt-2'>
            <Button label='Create Account' variant='primary' type="submit" />
          </div>
        </form>
      </section>
    </div>
  )
}
