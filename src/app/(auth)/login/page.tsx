"use client";

import React, { useState } from 'react'
import { useRouter } from 'next/navigation';

import useModal from '@/hooks/useModal';
import useIsHydrated from '@/hooks/useIsHydrated';

import Button from '@/components/ui/Button'
import InputField from '@/components/ui/InputField'
import Logo from '@/components/ui/Logo';
import { LoginFormData, LoginFormErrors } from '@/types/auth';

export default function Login() {
  const { openModal, closeModal } = useModal();
  const isHydrated = useIsHydrated();
  const router = useRouter();

  const [loginForm, setloginForm] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const field = name as keyof LoginFormData;

    setloginForm((prev) => (
      { ...prev, [name]: value, }
    ));

    // Clear errors when the user edits a field.
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleLogin = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent browser's default form submission behavior.

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      // Handle field-specific validation errors.
      if (!res.ok) {
        const details = data.details as
          | Record<string, string[]>
          | undefined;

        if (details) {
          setErrors({
            email: details.email?.[0],
            password: details.password?.[0],
          });

          return;
        }

        openModal({
          variant: "error",
          title: "Login Failed",
          description:
            data.error ??
            "An unexpected error occurred. Please try again.",
          primaryAction: {
            label: "Try again",
            onClick: closeModal,
          },
        });

        return;
      }

      closeModal();
      router.replace("/dashboard");
    } catch (err: unknown) {
      openModal({
        variant: "error",
        title: "Login Failed",
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
        <form noValidate data-hydrated={isHydrated} onSubmit={handleLogin}>
          <fieldset disabled={!isHydrated} className='space-y-3'>
            <header className='mb-4'>
              <Logo />
              <h1 className='text-gray-700'>Login</h1>
            </header>

            <hr className='text-gray-400 mb-6' />

            <InputField
              id='email'
              name='email'
              label='Email'
              type='email'
              placeholder='example@domain.com'
              value={loginForm.email}
              onChange={handleChange}
              required
              error={errors.email}
            />

            <div className='space-y-1'>
              <InputField
                id='password'
                name='password'
                label='Password'
                type='password'
                placeholder='********'
                value={loginForm.password}
                onChange={handleChange}
                required
              error={errors.password}
              />
            </div>
            <div className='pt-1'>
              <Button label='Login' variant='primary' type="submit" />
            </div>
          </fieldset>
        </form>
      </section>
    </div>
  )
}
