'use client';

import SidebarItem from './SidebarItem';
import { LayoutDashboard, Inbox, SquareCheck } from 'lucide-react';

export default function Sidebar() {
  return (
    <div
      className='
      min-w-50 h-full
      space-y-2
      p-4
      bg-gray-50
    '
    >
      <SidebarItem label='Dashboard' href='/dashboard' icon={LayoutDashboard} />
      <SidebarItem label='Inbox' href='/inbox' icon={Inbox} />
      <SidebarItem label='Tasks' href='/tasks' icon={SquareCheck} />
    </div>
  );
}
