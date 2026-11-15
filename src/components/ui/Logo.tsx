import React from 'react';
import { CircleCheck } from 'lucide-react';

export default function Logo() {
  return (
    <div className='flex items-center text-green-600 text-xl font-bold'>
      SCH
      <CircleCheck className='size-4.5 mt-0.5 text-green-600' strokeWidth={3} />.
    </div>
  );
}
