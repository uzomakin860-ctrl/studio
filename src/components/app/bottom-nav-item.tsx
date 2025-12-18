'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export const BottomNavItem = ({
  href,
  icon,
  label,
  isActive = false,
  hasBadge = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  hasBadge?: boolean;
}) => (
  <Link href={href}>
    <div
      className={cn(
        "flex flex-col items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors",
        isActive && "text-white font-bold"
      )}
    >
      <div className="relative">
        {icon}
        {hasBadge && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>}
      </div>
      {label}
    </div>
  </Link>
);
