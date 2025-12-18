
'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { user } = useUser();

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <header className="relative flex items-center justify-center mb-8">
        <Link href="/" passHref className="absolute left-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Profile</h1>
      </header>
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user?.photoURL || ''} />
          <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{user?.email?.split('@')[0]}</h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center mt-8">
        <h3 className="text-xl font-medium">Your posts will appear here</h3>
        <p className="text-sm text-muted-foreground">
          You haven&apos;t posted anything yet.
        </p>
         <Button className="mt-4" asChild>
            <Link href="/upload">Create Post</Link>
        </Button>
      </div>
    </div>
  );
}
