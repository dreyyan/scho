"use client";

import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
}

const SIDEBAR_ITEM_STYLES = {
  active: "bg-gray-200 text-gray-700 font-bold",
  default: "text-gray-600 hover:bg-gray-100",
};

export default function SidebarItem({
  label = "Page",
  href = "/",
  icon: Icon,
}: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`${SIDEBAR_ITEM_STYLES[isActive ? "active" : "default"]}
      flex gap-x-2
      rounded-lg
      px-3 py-2
      transition-colors duration-200
    `}
    >
      <Icon size={24} />
      <span>{label}</span>
    </Link>
  );
}
