'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export const BottomNavItem = ({
  href,
  icon,
  label,
  isActive = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}) => (
  <Link href={href}>
    <div
      className={cn(
        "flex flex-col items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors",
        isActive && "text-white font-bold"
      )}
    >
      {icon}
      {label}
    </div>
  </Link>
);
