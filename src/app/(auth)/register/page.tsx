"use client";

import React from 'react'
import InputField from '@/components/ui/InputField'
import Button from '@/components/ui/Button'
import Logo from '@/components/ui/Logo';

export default function Register() {
  const handleRegister = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO: POST request for user registration.
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

          <InputField
            id='email'
            name='email'
            label='Email'
            type='email'
            placeholder='example@domain.com'
          />

          {/* Password input field with requirements. */}
          <div className='space-y-1'>
            <InputField
              id='password'
              name='password'
              label='Password'
              type='password'
              placeholder='********'
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
          />
          
          <div className='pt-3'>
            <Button label='Create Account' variant='primary' type="submit" />
          </div>
        </form>
      </section>
    </div>
  )
}
