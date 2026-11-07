"use client";

import useModal from '@/hooks/useModal';
import { signOut } from 'next-auth/react';

export default function Dashboard() {
  const { openModal, closeModal } = useModal();
  const handleLogout = async () => {
    try {
      await signOut({ redirectTo: "/login" });
    } catch (err: unknown) {
      openModal({
        variant: "error",
        title: "Logout Failed",
        description: err instanceof Error ? err.message : "An unexpected error occured, please try again.",
        primaryAction: {
          label: "Try again",
          onClick: closeModal,
        },
      });
    }
  };

  return (
    <div>
      Dashboard
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
