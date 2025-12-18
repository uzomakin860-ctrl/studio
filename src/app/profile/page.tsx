
'use client';

import { ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc, useFirestore } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { achievements as allAchievements } from '@/lib/achievements';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}`) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const isLoading = isUserLoading || isProfileLoading;

  const displayedBadges = userProfile?.displayedBadges
    ?.map(badgeId => allAchievements.find(a => a.id === badgeId))
    .filter(Boolean) as (typeof allAchievements) | undefined;
    
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <header className="relative flex items-center justify-center mb-8">
        <Link href="/" passHref className="absolute left-0">
          <Button variant="ghost" size="icon">
            <ArrowLeft />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Profile</h1>
        <Link href="/profile/edit" passHref className="absolute right-0">
          <Button variant="ghost" size="icon">
            <Edit />
          </Button>
        </Link>
      </header>
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={userProfile?.profilePictureUrl || user?.photoURL || ''} />
          <AvatarFallback>{userProfile?.username?.[0].toUpperCase() || user?.email?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{userProfile?.username || user?.email?.split('@')[0]}</h2>
          <p className="text-muted-foreground">{userProfile?.bio || user?.email}</p>
        </div>

        {displayedBadges && displayedBadges.length > 0 && (
            <TooltipProvider>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    {displayedBadges.map((badge) => (
                        <Tooltip key={badge.id}>
                            <TooltipTrigger>
                                <Badge variant="secondary" className="flex items-center gap-1.5 p-2">
                                    <badge.icon className="h-4 w-4"/>
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="font-semibold">{badge.title}</p>
                                <p>{badge.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
        )}
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
