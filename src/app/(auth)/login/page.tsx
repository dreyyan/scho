'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import useModal from '@/hooks/useModal';
import useIsHydrated from '@/hooks/useIsHydrated';

import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import Logo from '@/components/ui/Logo';
import { LoginFormData, LoginFormErrors } from '@/types/auth';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function Login() {
  const { openModal, closeModal } = useModal();
  const isHydrated = useIsHydrated();
  const router = useRouter();

  const [loginForm, setloginForm] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const field = name as keyof LoginFormData;

    setloginForm((prev) => ({ ...prev, [name]: value }));

    // Clear errors when the user edits a field.
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleLogin = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent browser's default form submission behavior.

    try {
      const result = await signIn('credentials', {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      });

      if (result?.error) {
        openModal({
          variant: 'error',
          title: 'Login Failed',
          description: 'Invalid email or password.',
          primaryAction: {
            label: 'Try again',
            onClick: closeModal,
          },
        });

        return;
      }

      closeModal();
      router.replace('/dashboard');
    } catch (err: unknown) {
      openModal({
        variant: 'error',
        title: 'Login Failed',
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
        <form noValidate data-hydrated={isHydrated} onSubmit={handleLogin}>
          <fieldset disabled={!isHydrated} className='space-y-6'>
            <header className='mb-4'>
              <Logo />
              <h1 className='text-gray-700'>Login</h1>
            </header>

            <div className='space-y-4'>
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

            <div className='space-y-3'>
              <Button label='Login' variant='primary' type='submit' />
              <span className='flex justify-center items-center gap-x-1 text-sm text-gray-800'>
                Don&apos;t have an account yet?
                <Link href='/register' className='link'>
                  Create an Account
                </Link>
              </span>
            </div>
          </fieldset>
        </form>
      </section>
    </div>
  );
}
