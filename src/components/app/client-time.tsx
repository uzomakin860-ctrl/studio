'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';

interface ClientTimeProps {
  timestamp: Timestamp | null;
  className?: string;
}

export function ClientTime({ timestamp, className }: ClientTimeProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (timestamp) {
      setTimeAgo(formatDistanceToNow(timestamp.toDate(), { addSuffix: true }));
    }
  }, [timestamp]);

  if (!timeAgo) {
    // You can return a placeholder or null during the initial render
    return null; 
  }

  return <span className={className}>{timeAgo}</span>;
}
