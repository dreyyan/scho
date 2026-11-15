'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import useModal from '@/hooks/useModal';
import useIsHydrated from '@/hooks/useIsHydrated';

import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import Logo from '@/components/ui/Logo';
import { RegisterFormData, RegisterFormErrors } from '@/types/auth';
import Link from 'next/link';

export default function Register() {
  const { openModal, closeModal } = useModal();
  const isHydrated = useIsHydrated();
  const router = useRouter();

  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const field = name as keyof RegisterFormData;

    setRegisterForm((prev) => ({ ...prev, [name]: value }));

    // Clear errors when the user edits a field.
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleRegister = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent browser's default form submission behavior.

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();

      // Handle field-specific validation errors.
      if (!res.ok) {
        const details = data.details as Record<string, string[]> | undefined;

        if (details) {
          setErrors({
            email: details.email?.[0],
            password: details.password?.[0],
            confirmPassword: details.confirmPassword?.[0],
          });

          return;
        }

        openModal({
          variant: 'error',
          title: 'Registration Failed',
          description: data.error ?? 'An unexpected error occurred. Please try again.',
          primaryAction: {
            label: 'Try again',
            onClick: closeModal,
          },
        });

        return;
      }

      openModal({
        variant: 'success',
        title: 'Registration Successful',
        description: 'Your account was created successfully!',
        primaryAction: {
          label: 'Continue to Login',
          onClick: () => {
            closeModal();
            router.replace('/login');
          },
        },
      });
    } catch (err: unknown) {
      openModal({
        variant: 'error',
        title: 'Registration Failed',
        description:
          err instanceof Error ? err.message : 'An unexpected error occured, please try again.',
        primaryAction: {
          label: 'Try again',
          onClick: closeModal,
        },
      });
    }
  };

  return (
    <div className='flex min-h-screen justify-center items-center'>
      <section className='form'>
        <form noValidate data-hydrated={isHydrated} onSubmit={handleRegister}>
          <fieldset disabled={!isHydrated} className='space-y-6'>
            <header className='mb-4'>
              <Logo />
              <h1 className='text-gray-700'>Sign up</h1>
            </header>

            <div className='space-y-4'>
              <InputField
                id='email'
                name='email'
                label='Email'
                type='email'
                placeholder='example@domain.com'
                value={registerForm.email}
                onChange={handleChange}
                required
                error={errors.email}
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
                  required
                  error={errors.password}
                />
                <p id='password-requirements' className='text-xs font-semibold text-gray-400'>
                  At least 8 characters, including uppercase, lowercase, and a symbol.
                </p>
              </div>

              <InputField
                id='confirm-password'
                name='confirmPassword'
                label='Confirm Password'
                type='password'
                placeholder='********'
                aria-describedby='password-requirements'
                value={registerForm.confirmPassword}
                onChange={handleChange}
                required
                error={errors.confirmPassword}
              />
            </div>

            <div className='space-y-3'>
              <Button label='Create Account' variant='primary' type='submit' />
              <span className='flex justify-center items-center gap-x-1 text-sm text-gray-800'>
                Already have an account?
                <Link href='/login' className='link'>
                  Login
                </Link>
              </span>
            </div>
          </fieldset>
        </form>
      </section>
    </div>
  );
}
