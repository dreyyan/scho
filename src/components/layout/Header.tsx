"use client";

import React from 'react'
import Logo from '../ui/Logo'
import { CircleUserRound, Settings } from 'lucide-react'
import Link from 'next/link';

export default function Header() {
  const handleProfile = () => {
    // TODO: Navigate to the user's profile.
  };

  const handleSettings = () => {
    // TODO: Navigate to the settings.
    
  };

  return (
    <div className='
      flex justify-between min-h-16
      px-10 py-6
      bg-gray-50
    '>
      <Link href='/dashboard'>
        <Logo />
      </Link>

      <div className='flex justify-center items-center space-x-4'>
        <button onClick={handleProfile}><CircleUserRound /></button>
        <Link href="/settings">
          <Settings />
        </Link>
      </div>
    </div>
  )
}
